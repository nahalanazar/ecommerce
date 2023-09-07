const Banner = require('../models/bannerModel')
const mongoose = require('mongoose')
const{ObjectId} = require('mongodb')

const bannerListHelper = async () => {
    try {
        const response = await Banner.find();
        return response;
    } catch (error) {
        throw error;  // propagate the error upwards, so you can handle it where this function is called
    }
};

const addBannerHelper = async(texts, image) => {
    try {
        const banner = new Banner({
            title: texts.title,
            link: texts.link,
            image: image
        })
        const response = await banner.save()
        return response
    } catch (error) {
        throw error
    }
}

const editBannerHelper = async (bannerId) => {
    try {
        const response = await Banner.aggregate([
            {
                $match: { _id: new mongoose.Types.ObjectId(bannerId) }
            },
            {
                $project: {
                    title: 1,
                    image: 1,
                    link: 1
                }
            }
        ]);
        return response;
    } catch (error) {
        console.log(error.message);
    }
}

const updateBannerHelper = async (data, image) => {
    try {
        const bannerData = await Banner.updateOne(
            {
                _id: new ObjectId(data.id)
            },
            {
                $set: {
                    title: data.title,
                    link: data.link,
                    image: image
                } 
            }
        )
    } catch (error) {
        console.log(error.message)
    }
}

const deleteBannerHelper = async (deleteId) => {
    try {
        await Banner.deleteOne({_id: deleteId})
    } catch (error) {
        console.log(error.message)
    }
}

module.exports = {
    bannerListHelper,
    addBannerHelper,
    editBannerHelper,
    updateBannerHelper,
    deleteBannerHelper
}