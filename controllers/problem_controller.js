var fs = require('fs');
var lang = require('../lang.json');
var request = require('request-promise');
// var request = require('request-promise').defaults({ proxy:'http://manodyna:chinnamma@localhost:8080', strictSSL :false });
var Problem = require('../models/problem');
var Testcase = require('../models/testcase');
var Submission = require('../models/submission');
var Announcement = require('../models/announcement');

// works
exports.get_all_problem = function(req, res) {
    Problem.find({ avail: true }, function(err, problem) {
        if (err) {
            console.log(err);
            return
        }
        Announcement.find({}, function(err, an_res) {
            res.render('problemlist', { user: req.user, problem: problem, announcement: an_res });
        })
    })
};

//works
exports.get_problem_list = function(req, res) {
    Announcement.find({}, function(err, an_res) {
        res.render('problemlist', { user: req.user, announcement: an_res });
    })
};

//works
exports.get_all_problem_with_tag = function(req, res) {
    Problem.find({ avail: true, tags: req.params.tag.replace('_', ' ') }, function(err, problem) {
        if (err) {
            console.log(err);
        }
        res.render('problemlist', { user: req.user, problem: problem });
    });
};

//works
exports.get_all_problem_with_diff = function(req, res) {
    Problem.find({ avail: true, difficulty: parseInt(req.params.diff) }, function(err, problem) {
        if (err) {
            console.log(err);
        }
        res.render('problemlist', { user: req.user, problem: problem });
    });
};

//works
exports.get_problem = function(req, res) {
    Problem.findOne({ avail: true, pid: req.params.pid }, function(err, prob_res) {
        if (err) return console.log(err);
        if (!prob_res) {
            res.render('error', { user: req.user, message: 'Problem not found. Maybe <code>avail</code> was set to <code>false</code>.' });
        }
        res.render('problem', { user: req.user, content: prob_res, result: null, accepted: null, submitLang: req.cookies.submitLang, langlist: lang });
    });
};

//custom works
exports.post_submission = async function (req, res, next) {
    const response = await fetch(
        "https://judge0-ce.p.rapidapi.com/submissions",
        {
            method: "POST",
            headers: {
                "x-rapidapi-host": "judge0-ce.p.rapidapi.com",
                "x-rapidapi-key": "f27ee1e806mshc669322161c3a3bp1d32f8jsn5326f60e5117", // Get yours for free at https://rapidapi.com/judge0-official/api/judge0-ce/
                "content-type": "application/json",
                accept: "application/json",
            },
            body: {
                "source_code": req.body.sourcecode,
                "language_id": parseInt(req.body.lang),
                "stdin": req.body.input
            },
            json:true
        }
    );

    const jsonResponse = await response.json();

    let jsonGetSolution = {
        status: { description: "Queue" },
        stderr: null,
        compile_output: null,
    };

    while (
        jsonGetSolution.status.description !== "Accepted" &&
        jsonGetSolution.stderr == null &&
        jsonGetSolution.compile_output == null
        ) {  if (jsonResponse.token) {
        let url = `https://judge0-ce.p.rapidapi.com/submissions/${jsonResponse.token}?base64_encoded=true`;

        const getSolution = await fetch(url, {
            method: "GET",
            headers: {
                "x-rapidapi-host": "judge0-ce.p.rapidapi.com",
                "x-rapidapi-key": "f27ee1e806mshc669322161c3a3bp1d32f8jsn5326f60e5117", // Get yours for free at https://rapidapi.com/judge0-official/api/judge0-ce/
                "content-type": "application/json",
            },
        });

        jsonGetSolution = await getSolution.json();
    }
}
    // var get_result = function (data, sourcecode, submission_id) {
//         var result = '',
//             score = 0,
//             time_avg = 0,
//             mem_avg = 0;
//         for (var i = 0; i < data.length; i++) {
//             time_avg += parseFloat(data[i].time);
//             mem_avg += data[i].memory;
//             if (data[i].status.id === 3) {
//                 result += 'P';
//                 score++;
//             } else if (data[i].status.id === 4 || data[i].status.id === 13) result += '-';
//             else if (data[i].status.id === 5) result += 'T';
//             else if (data[i].status.id === 6) {
//                 result = 'Compilation Error';
//                 break;
//             } else result += 'X';
//         }
//         const submission_result = {str: result, time: time_avg / data.length, memory: mem_avg / data.length}
//         Submission.updateOne({_id: submission_id}, {in_queue: false, result: submission_result}, (err, res) => {
//             if (err) console.log(err)
//         });
//         if (score === data.length) {
//             Problem.findOneAndUpdate({pid: req.params.pid}, {$inc: {solved: 1}}, function (err) {
//                 if (err) console.log(err);
//             });
//         }
//     }
//     fs.readFile(req.file.path, "utf8", async function(err, sourcecode) {
//         Testcase.findOne({ pid: req.params.pid }, async function (err, test_res) {
//             if (err) return console.log(err);
//             let options = [];
//             for (var i = 0; i < test_res.cases.length; i++) {
//                 const response = await
//
//                 fetch({
//                     method: 'POST',
//                     // uri: 'http://192.168.1.249:2358/submissions/?base64_encoded=false',
//                     url: 'https://judge0-ce.p.rapidapi.com/submissions',
//                     headers: {
//                         'content-type': 'application/json',
//                         'x-rapidapi-host': 'judge0-ce.p.rapidapi.com',
//                         'x-rapidapi-key': 'f27ee1e806mshc669322161c3a3bp1d32f8jsn5326f60e5117',
//                         useQueryString: true
//                     },
//                     body: {
//                         "source_code": sourcecode,
//                         "language_id": parseInt(req.body.lang),
//                         "stdin": test_res.cases[i].in,
//                         "expected_output": test_res.cases[i].out,
//                         "cpu_time_limit": test_res.time_limit,
//                         "memory_limit": test_res.memory_limit * 1000
//                     },
//                     // proxy: 'http://localhost:8080',
//                     json: true
//                 });
//
//                 const jsonResponse = await response.json;
//             }
//             var new_submission = new Submission({
//                 pid: req.params.pid,
//                 lang: lang[parseInt(req.body.lang) - 1].name,
//                 username: req.user ? req.user.username : 'Guest',
//                 sourcecode: sourcecode,
//                 submit_time: new Date(),
//                 in_queue: true
//             });
//             new_submission.save(function (err, submission) {
//                 if (err) console.log(err);
//                 res.redirect('/admin')
//                 fs.unlink(req.file.path, () => {
//                 });
//                 const getTokens = options.map(opt => request(opt).then(res => res.token));
//                 Promise.all(getTokens).then(tokens => {
//                     setTimeout(() => {
//                         Promise.all(tokens.map(token => request('https://judge0-ce.p.rapidapi.com/submissions/${token}/?f27ee1e806mshc669322161c3a3bp1d32f8jsn5326f60e5117').then(res => JSON.parse(res))))
//                             .then(async data => {
//                                 get_result(data, sourcecode, submission.id)
//                             })
//                     }, 10000);
//                 })
//             });
//         });
//     });
};



//does not work
exports.post_submission_live_editor = function(req, res, next) {
    var get_result = function(data, sourcecode, submission_id) {
        var result = '',
            score = 0,
            time_avg = 0,
            mem_avg = 0;
        for (var i = 0; i < data.length; i++) {
            time_avg += parseFloat(data[i].time);
            mem_avg += data[i].memory;
            if (data[i].status.id === 3) {
                result += 'P';
                score++;
            } else if (data[i].status.id === 4 || data[i].status.id === 13) result += '-';
            else if (data[i].status.id === 5) result += 'T';
            else if (data[i].status.id === 6) {
                result = 'Compilation Error';
                break;
            } else result += 'X';
        }

        const submission_result = { str: result, time: time_avg / data.length, memory: mem_avg / data.length }
        Submission.updateOne({ _id: submission_id }, { in_queue: false, result: submission_result }, (err, res) => {
            if (err) console.log(err)
        });

        if (score === data.length) {
            Problem.findOneAndUpdate({ pid: req.params.pid }, { $inc: { solved: 1 } }, function(err) {
                if (err) console.log(err);
            });
        }

        //uncommenting from here
        // Problem.findOne({avail: true, pid: req.params.pid}, function (err, prob_res) {
        //     if (err) return console.log(err);
        //     if (score === data.length) {
        //         if (req.cookies.solved_pid == null) {
        //             res.cookie('solved_pid', req.params.pid, { expires: new Date(Date.now() + 2592000000) });
        //         } else {
        //             res.cookie('solved_pid', req.cookies.solved_pid + ',' + req.params.pid, { expires: new Date(Date.now() + 2592000000) });
        //         }
        //     }
        //     res.cookie('submitLang' , req.body.lang, { expires: new Date(Date.now() + 2592000000) })
        //     .render('problem', {user: req.user, content: prob_res, result: result, accepted: score === data.length, submitLang: req.cookies.submitLang, langlist: lang});
        // });
    //    commented to here
    }

    Testcase.findOne({ pid: req.params.pid }, function(err, test_res) {
        if (err) return console.log(err);
        let options = [];
        for (var i = 0; i < test_res.cases.length; i++) {
            options.push({
                method: 'POST',
                uri: 'https://judge0-ce.p.rapidapi.com/submissions/?base64_encoded=false',
                headers: {
                    'content-type': 'application/json',
                    'x-rapidapi-host': 'judge0-ce.p.rapidapi.com',
                    'x-rapidapi-key': 'f27ee1e806mshc669322161c3a3bp1d32f8jsn5326f60e5117',
                    useQueryString: true
                },
                body: {
                    "source_code": req.body.sourcecode,
                    "language_id": parseInt(req.body.lang),
                    "stdin": test_res.cases[i].in,
                    "expected_output": test_res.cases[i].out,
                    "cpu_time_limit": test_res.time_limit,
                    "memory_limit": test_res.memory_limit * 1000
                },
                // proxy: 'http://localhost:8080',
                json: true
            });
        }

        var new_submission = new Submission({
            pid: req.params.pid,
            // lang: lang[parseInt(req.body.lang) - 1].name,
            lang: lang.name,
            username: req.user ? req.user.username : 'Guest',
            sourcecode: req.body.sourcecode,
            submit_time: new Date(),
            in_queue: true
        });
        new_submission.save(async function(err, submission) {
            if (err) console.log(err);
            res.redirect('/admin')
            const getTokens = options.map(opt => request(opt).then(res => res.token));
            Promise.all(getTokens).then(tokens => {
                setTimeout(() => {
                    Promise.all(tokens.map(token => request('https://judge0-ce.p.rapidapi.com/submissions/${token}/?f27ee1e806mshc669322161c3a3bp1d32f8jsn5326f60e5117').then(res => JSON.parse(res))))
                        .then(data => {
                            get_result(data, req.body.sourcecode, submission.id)
                        })
                }, 1000000);
            })
        });
    });
};

exports.get_custom_test = function(req, res) {
    res.render('custom_test', { user: req.user, submitLang: req.cookies.submitLang, langlist: lang, result: null, request: null });
};

exports.post_custom_test_live = function(req, res) {
    var options = {
        method: 'POST',
        uri: 'https://judge0-ce.p.rapidapi.com/submissions/?base64_encoded=false&wait=true',
        headers: {
             'content-type': 'application/json',
            'x-rapidapi-host': 'judge0-ce.p.rapidapi.com',
            'x-rapidapi-key': 'f27ee1e806mshc669322161c3a3bp1d32f8jsn5326f60e5117',
            useQueryString: true
        },
        body: {
            "source_code": req.body.sourcecode,
            "language_id": parseInt(req.body.lang),
            "stdin": req.body.input
        },
        // proxy: 'http://localhost:8080',
        json: true
    };
    request(options, function(err, result, body) {
        console.log(body);
        res.cookie('submitLang', req.body.lang, { expires: new Date(Date.now() + 2592000000) });
        res.render('custom_test', { user: req.user, submitLang: req.cookies.submitLang, langlist: lang, result: body, request: { stdin: req.body.input, sourcecode: req.body.sourcecode } });
    });
};