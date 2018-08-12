var nodemailer = require('nodemailer'); // Add nodemailer

exports.email = function() {
    return function (req, res) {
        console.log(req.body);

        transporter = nodemailer.createTransport({
            sendmail: true,
            newline: 'unix',
            path: '/usr/sbin/sendmail'
        });
        
            transporter.sendMail({
            from: 'warning@localhost',
            to: 'gavin.abson@gmail.com',
            subject: 'Warning: ' + req.body.name,
            text: 'Ingredient ' + req.body.name + ' has run out.'
        }, (err, info) => {
            console.log(info.envelope);
            console.log(info.messageId);
        });
    
        // Return a response
        res.send(req.body);
    };
};