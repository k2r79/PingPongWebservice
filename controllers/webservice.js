var express = require('express');
var router = express.Router();

router.get('/', function(req, res) {
    res.send({
        firstname: 'Coucou',
        lastname: 'Toi !'
    });
});

module.exports = router;