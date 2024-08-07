import e, { query } from 'express';
import db from '../dist/db/models/index.js';
import bcrypt from 'bcrypt';
import { Model, where } from 'sequelize';
import { DEFAULT_EXTENSIONS } from '@babel/core';

const createUser = async (req) => {
    const {
        name,
        email,
        password,
        password_second,
        cellphone
    } = req.body;
    if (password !== password_second) {
        return {
            code: 400,
            message: 'Passwords do not match'
        };
    }
    const user = await db.User.findOne({
        where: {
            email: email
        }
    });
    if (user) {
        return {
            code: 400,
            message: 'User already exists'
        };
    }

    const encryptedPassword = await bcrypt.hash(password, 10);

    const newUser = await db.User.create({
        name,
        email,
        password: encryptedPassword,
        cellphone,
        status: true
    });
    return {
        code: 200,
        message: 'User created successfully with ID: ' + newUser.id,
    }
};

const getUserById = async (id) => {
    return {
        code: 200,
        message: await db.User.findOne({
            where: {
                id: id,
                status: true,
            }
        })
    };
}

const updateUser = async (req) => {
    const user = db.User.findOne({
        where: {
            id: req.params.id,
            status: true,
        }
    });
    const payload = {};
    payload.name = req.body.name ?? user.name;
    payload.password = req.body.password ? await bcrypt.hash(req.body.password, 10) : user.password;
    payload.cellphone = req.body.cellphone ?? user.cellphone;
    await db.User.update(payload, {
        where: {
            id: req.params.id
        }

    });
    return {
        code: 200,
        message: 'User updated successfully'
    };
}

const deleteUser = async (id) => {
    /* await db.User.destroy({
        where: {
            id: id
        }
    }); */
    const user = db.User.findOne({
        where: {
            id: id,
            status: true,
        }
    });
    await  db.User.update({
        status: false
    }, {
        where: {
            id: id
        }
    });
    return {
        code: 200,
        message: 'User deleted successfully'
    };
}

const getAllUsers = async () => {
    const users = await db.User.findAll({
        where:{
            status: true
        }
    });
    return {
        code: 200,
        message: users
    }
}

const findUsers = async (query) => {
    const filter = {};
    const before = query.before;
    const after = query.after;

    if (query.status !== undefined) {
        if (query.status === 'true' || query.status === '1') {
            filter.status = true;
        } else if (query.status === 'false' || query.status === '0') {
            filter.status = false;
        } else {
            return {
                code: 400,
                message: 'Status invalid parameter'
            };
        }
    }
    if (query.name) {
        filter.name = { [db.Sequelize.Op.like]: `%${query.name}%` };
    }
    const users = await db.User.findAll({
        where: filter,
        include: [{
            model: db.Session,
            attributes: ['expiration'],
            where: {
                expiration: {
                    [db.Sequelize.Op.and]: [
                        ...(before ? [{ [db.Sequelize.Op.lt]: before }] : []),
                        ...(after ? [{ [db.Sequelize.Op.gt]: after }] : [])
                    ]
                }
            },
            order: [['expiration', 'DESC']],
            limit: 1
        }]
    });
    const filteredUsers = users.filter(user => user.Sessions.length > 0);
    return {
        code: 200,
        message: filteredUsers
    };
};

const bulkCreate = async (users) => {
    let successful = 0;
    let failed = 0;
    for (const user of users){
        try {
            const existingUser = await db.User.findOne({
                where: {
                    email: user.email
                }
            });
            if (existingUser) {
                failed ++;
                continue;
            }
        
            const encryptedPassword = await bcrypt.hash(user.password, 10);
            await db.User.create({
                ...user,    
                password: encryptedPassword,
                status: true
            });
            successful ++;
        }catch (error){
            failed ++;
        }
    }
    return {
        code: 200,
        message:  `Successfully ${successful} users and Failed to create ${failed} users.`
    }
}

export default {
    bulkCreate,
    findUsers,
    getAllUsers,
    createUser,
    getUserById,
    updateUser,
    deleteUser,
}