const { rTime, timestamp } = require("../../../utils/timeformat");
const DB = require("../../../db");
const jwt = require("jsonwebtoken");
const config = require("../../../config");


exports.recycleBinList = async (req, res) => {
    let payload = null;
    try {
        const authorizationHeader = req.get("Authorization");
        const accessToken = authorizationHeader;
        payload = jwt.verify(accessToken, config.jwtSecret);
    } catch (error) {
        return res.status(401).json({
            code: 401,
            message: "TOKEN 已过期",
        });
    }

    let params = {
        type: req.query.type || '1',
        status: req.query.status || "",
        isRecycle: req.query.isRecycle || "1",
        title: req.query.title || "",
        checkStatus: req.query.checkStatus || "",
        page: req.query.page || 1,
        pageSize: req.query.pageSize || 10,
    };
    if (params.type == 1) {
        let result_num = await DB(
            res,
            "xcx_blog_post",
            "find",
            "服务器错误",
            `title like '%${params.title}%' and isRecycle like '%${params.isRecycle}%' and status like '%${params.status}%' and checkStatus like '%${params.checkStatus}%'`
        );

        let result = await DB(
            res,
            "xcx_blog_post",
            "find",
            "服务器错误",
            `title like '%${params.title}%' and isRecycle like '%${params.isRecycle
            }%' and status like '%${params.status}%' and  checkStatus like '%${params.checkStatus
            }%'  order by id desc  limit ${(params.page - 1) * params.pageSize},${params.pageSize
            }`
        );
        result.forEach((v, i) => {
            v.cover = v.cover ? [v.cover] : '';
            if (v.createTime) {
                v.createTime = rTime(timestamp(v.createTime));
            }
            if (v.updateTime) {
                v.updateTime = rTime(timestamp(v.updateTime));
            } else {
                delete v.updateTime;
            }
        });

        if (!result[0]) {
            res.json({
                code: 200,
                result: {
                    items: [],
                },
            });
        } else {
            res.json({
                code: 200,
                result: {
                    items: result,
                    total: result_num.length,
                    page: Number(params.page),
                    pageSize: Number(params.pageSize),
                },
            });
        }
    } else {
        let result_num = await DB(
            res,
            "xcx_blog_subject",
            "find",
            "服务器错误",
            `title like '%${params.title}%' and isRecycle like '%${0}%' and status like '%${params.status}%' and checkStatus like '%${params.checkStatus}%'`
        );

        let result = await DB(
            res,
            "xcx_blog_subject",
            "find",
            "服务器错误",
            `title like '%${params.title}%' and isRecycle like '%${0
            }%' and status like '%${params.status}%' and  checkStatus like '%${params.checkStatus
            }%'  order by id desc  limit ${(params.page - 1) * params.pageSize},${params.pageSize
            }`
        );
        result.forEach((v, i) => {
            v.postIds = v.postIds.split(",").map(Number);
            v.num = v.postIds.length;
            v.cover = [v.cover];
            if (v.createTime) {
                v.createTime = rTime(timestamp(v.createTime));
            }
            if (v.updateTime) {
                v.updateTime = rTime(timestamp(v.updateTime));
            } else {
                delete v.updateTime;
            }
        });

        if (!result[0]) {
            res.json({
                code: 200,
                result: {
                    items: [],
                },
            });
        } else {
            res.json({
                code: 200,
                result: {
                    items: result,
                    total: result_num.length,
                    page: Number(params.page),
                    pageSize: Number(params.pageSize),
                },
            });
        }
    }

};