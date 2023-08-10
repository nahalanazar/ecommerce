const Address = require('../models/addressModel')

const submitAddress = async (userId, newAddress) => {
    const updatedUser = await Address.findOneAndUpdate(
        {user: userId},
        {$push: {addresses: newAddress}},
        {new: true}
    )
    return updatedUser
}

const createAddress = async (userId, newAddress) => {
    const userAddress = new Address({
        user: userId,
        addresses: [newAddress]
    })
    await userAddress.save()
}

module.exports = {
    submitAddress,
    createAddress
}