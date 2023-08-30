const Banner = require('../models/bannerModel')
const bannerHelper = require('../helper/bannerHelper')

const bannerList = async (req, res) => {
    try {
        bannerHelper.bannerListHelper().then((response) => {
            res.render('bannerList', {banners: response})
        })
    } catch (error) {
        console.log(error.message)
    }
}

const addBannerGet = async (req, res) => {
    try {
        res.render('addBanner')
    } catch (error) {
        console.log(error)
    }
}

const addBannerPost = async (req, res) => {
    bannerHelper.addBannerHelper(req.body, req.file.filename).then((response) => {
        if (response) {
            res.redirect('/admin/bannerList')
        } else {
            res.status(500).send('Error encountered');
        }
    })
}

const loadEditBanner = async (req, res) => {
    bannerHelper.editBannerHelper(req.query.id).then((response) => {
        res.render('updateBanner', {banner: response[0]})
    })
}

const editBanner = async (req, res) => { 
    try {
        const bannerData = await Banner.findById(req.body.id)
        const updatedImage = req.file ? req.file.filename : bannerData.image;
        await bannerHelper.updateBannerHelper(req.body, updatedImage)
        res.redirect('/admin/bannerList')
    } catch (error) {
        console.log(error.message)
    }
}

const deleteBanner = async (req, res) => {
    bannerHelper.deleteBannerHelper(req.query.id).then((response) => {
        res.redirect('/admin/bannerList')
    })
}

module.exports = {
    bannerList,
    addBannerGet,
    addBannerPost,
    loadEditBanner,
    editBanner,
    deleteBanner
}