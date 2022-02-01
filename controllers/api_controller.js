var Problem = require('../models/problem');
var Submission = require('../models/submission');
var langList = require('../lang');
var request = require('request-promise');

exports.get_all_problem = function(req, res) {
    Problem.find({ avail: true }, { _id: 0, pid: 1, name: 1, difficulty: 1, solved: 1, tags: 1 }, function(err, problem) {
        if (err) {
            console.log(err);
        }
        res.json(problem);
    });
};

exports.post_submit_custom = function(req, res) {
    var options = {
        method: 'POST',
        uri: 'http://192.168.1.103:2358/submissions/?base64_encoded=false&wait=true',
        body: {
            "source_code": req.body.sourcecode,
            "language_id": parseInt(req.body.lang),
            "stdin": req.body.input
        },
        json: true
    };
    request(options, function(err, result, body) {
        res.json({
            stdout: body.stdout,
            time: body.time,
            memory: body.memory,
            stderr: body.stderr
        })
    });
};

exports.get_submission = function(req, res) {
    Submission.findOne({ _id: req.params.sid }, { '__v': 0 }, function(err, sub_res) {
        if (sub_res) {
            res.json(sub_res);
        } else {
            res.status(404).json({ error: 'Submission not found.' });
        }
    });
};

exports.get_all_lang = function(req, res) {
    res.json(langList);
};