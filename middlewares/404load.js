
const Page404 =((req, res, next) => {
    res.status(404).render('404', {
        message: 'Page not found.'
    });
});

module.exports= Page404