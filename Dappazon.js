const { expect } = require("chai");
const { ethers } = require("hardhat");

const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), 'ether')
}
const id = 1;
const name = "Shoe";
const category = "Clothing";
const image = "image";
const cost = tokens(1);
const rating = 4;
const stock = 5;

describe("Dappazon", () => {
  let dappazonInstance;
  let deployer, buyer;

  beforeEach(async () => {
    [deployer, buyer] = await ethers.getSigners()
    // console.log(deployer.address, buyer.address);
    const Dappazon = await ethers.getContractFactory("Dappazon");
    dappazonInstance = await Dappazon.deploy();
  })
  describe("Deployment", () => {
    it("Sets the owner", async () => {

      expect(await dappazonInstance.owner()).to.equal(deployer.address)
    })

  })

  describe("Listing", () => {
    let transaction;
    beforeEach(async () => {
      transaction = await dappazonInstance.connect(deployer).list(
        id,
        name,
        category,
        image,
        cost,
        rating,
        stock
      )
      await transaction.wait();
      transaction = await dappazonInstance.connect(buyer).buy(id, { value: cost })
    })
    it("Returns item attributes", async () => {
      const item = await dappazonInstance.items(id);
      expect(item.id).to.equal(id);
      // console.log(item)
    })
    it("Emits the list event", async () => {
      expect(await transaction).to.emit(dappazonInstance, "List")
    })
    it("Returns the balance of contract", async () => {
      const result = await ethers.provider.getBalance(dappazonInstance.address)
      expect(result).to.equal(cost);
    })
    it("Gets the order count", async () => {
      const result = await dappazonInstance.orderCount(buyer.address);
      expect(result).to.equal(1);
    })
    it("Gets the order item name", async () => {
      const result = await dappazonInstance.orders(buyer.address, 1);
      expect(result.time).to.be.greaterThan(0);
      expect(result.item.name).to.equal(name);
    })
    it("Emits the buy event", async () => {
      expect(await transaction).to.emit(dappazonInstance, "buy")
    })
  })
  describe("Withdrawing", () => {
    let transaction;
    beforeEach(async () => {
      transaction = await dappazonInstance.connect(deployer).list(
        id,
        name,
        category,
        image,
        cost,
        rating,
        stock
      )
      await transaction.wait();
      transaction = await dappazonInstance.connect(buyer).buy(id, { value: cost });
      await transaction.wait()

      beforeBalance = await ethers.provider.getBalance(deployer.address);

      transaction = await dappazonInstance.connect(deployer).withdraw()
      await transaction.wait()
    })
    it("Adds the owner balance", async () => {
      const afterBalance = await ethers.provider.getBalance(deployer.address);
      expect(afterBalance).to.be.greaterThan(beforeBalance);
      // console.log(item)
    })
    it("Updates the contract balance to 0", async () => {
      const contractBalance = await ethers.provider.getBalance(dappazonInstance.address);
      expect(contractBalance).to.equal(0);
      // console.log(item)
    })

  })

})
