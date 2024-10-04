const userPage404 =((req, res, next) => {
    res.status(404).render('user404', {
        message: 'Page not found.'
    });
});

module.exports= userPage404