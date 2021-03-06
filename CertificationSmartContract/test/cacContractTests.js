const CacContract = artifacts.require("CacContract");

contract("CacContract", accounts => {
    it("should issue certification", async () => {
        const instance = await CacContract.deployed();

        const subject = "Agile Coach";
        const firstName = "Zhe";
        const lastName = "Qu";
        const issueDate = Date.UTC(2019, 1, 1);
        const expireDate = Date.UTC(2021, 1, 1);
        const additionalData = "JSON string";
        const to = accounts[1];

        const tx = await instance.issue(subject, firstName, lastName, issueDate, expireDate, additionalData, to);
        const tokenId = tx.logs[0].args.tokenId;
        const calculatedTokenId = web3.utils.soliditySha3(subject, firstName, lastName, issueDate);
        expect(tokenId.eq(web3.utils.toBN(calculatedTokenId))).to.be.true;

        const certification = await instance.certifications(tokenId);
        expect(certification.subject).to.equal(subject);
        expect(certification.firstName).to.equal(firstName);
        expect(certification.lastName).to.equal(lastName);
        expect(certification.issueDate.eq(web3.utils.toBN(issueDate))).to.be.true;
        expect(certification.expireDate.eq(web3.utils.toBN(expireDate))).to.be.true;
        expect(certification.additionalData).to.equal(additionalData);
    });

    it("should not issue certification for non-minter", async () => {
        const instance = await CacContract.deployed();
        const previousCount = await instance.totalSupply();

        const subject = "Agile Coach";
        const firstName = "Zhe";
        const lastName = "Qu";
        const issueDate = Date.UTC(2019, 1, 2);
        const expireDate = Date.UTC(2021, 1, 2);
        const additionalData = "JSON string";
        const to = accounts[1];

        try {
            await instance.issue(subject, firstName, lastName, issueDate, expireDate, additionalData, to, {from: accounts[1]});
        } catch {} finally {
            const count = await instance.totalSupply();
            expect(count.eq(previousCount)).to.be.true;
        }
    });

    it("should be able to add minter", async () => {
        const instance = await CacContract.deployed();

        await instance.addMinter(accounts[1], {from: accounts[0]});

        const subject = "Agile Coach";
        const firstName = "Zhe";
        const lastName = "Qu";
        const issueDate = Date.UTC(2019, 1, 3);
        const expireDate = Date.UTC(2021, 1, 3);
        const additionalData = "JSON string";
        const to = accounts[2];

        const tx = await instance.issue(subject, firstName, lastName, issueDate, expireDate, additionalData, to, {from: accounts[1]});
        const tokenId = tx.logs[0].args.tokenId;
        const calculatedTokenId = web3.utils.soliditySha3(subject, firstName, lastName, issueDate);
        expect(tokenId.eq(web3.utils.toBN(calculatedTokenId))).to.be.true;
    });
});
