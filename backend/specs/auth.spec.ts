import { User, UserSession } from '../src/models/user';
import app from '../src/app';
import request from 'supertest';
import bcrypt from 'bcrypt';
import { Op } from 'sequelize';

describe('authentication', () => {

    type MockUser = Partial<User>;
    let mockUsers: MockUser[];

    type MockSession = Partial<UserSession>;
    let mockSessions: MockSession[];

    User.create = jest.fn().mockImplementation(async (mockUser: MockUser) => {
        return Promise.resolve(mockUsers.push(mockUser));
    });

    User.findOne = jest.fn().mockImplementation(async ({ where }) => {
        const email = where.email;
        if (email && email[Op.iLike]) {
            const searchEmail = email[Op.iLike];
            return Promise.resolve(mockUsers.find(user => user.email?.toLowerCase() === searchEmail.toLowerCase()) || null);
        }
        return Promise.resolve(mockUsers.find(user => user.email === email) || null);
    });

    UserSession.create = jest.fn().mockImplementation(async (mockSession: MockSession) => {
        return Promise.resolve(mockSessions.push(mockSession));
    });

    UserSession.findOne = jest.fn().mockImplementation(async ({ where }) => {
        const sessionId = where.sessionId;
        const foundSession = mockSessions.find(session => session.sessionId === sessionId) || null;
        //Objekt hat destroy Methode
        return Promise.resolve(foundSession ? Object.assign(foundSession, { destroy: jest.fn() }) : null);
    });

    UserSession.prototype.destroy = jest.fn().mockImplementation(() => {
        mockSessions.pop();
        return Promise.resolve();
    });

    //Setup
    beforeEach(() => {
        mockUsers = [];
        mockSessions = [];
    });
    afterEach(() => {
        jest.restoreAllMocks();
    });

    //it -> Testcase
    it('should add new user upon registration', async () => {
        const response = await request(app)
            .post('/api/register')
            .send({
                firstName: 'first',
                lastName: 'last',
                street: 'street',
                streetNumber: '1',
                plz: '78224',
                city: 'city',
                email: 'first.last@test.de',
                password: 'test',
            })
            .expect(200);

        expect(response.body.code).toBe(200);
        expect(mockUsers).toHaveLength(1);
        expect(mockSessions).toHaveLength(1);
        expect(bcrypt.compareSync('test', mockUsers[0].password as string)).toBe(true);
    });

    it('should fail registering same user', async () => {
        // First registration
        await request(app)
            .post('/api/register')
            .send({
                firstName: 'first',
                lastName: 'last',
                street: 'street',
                streetNumber: '1',
                plz: '78224',
                city: 'city',
                email: 'first.last@test.de',
                password: 'test',
            })
            .expect(200);

        // Second registration attempt with same email
        const response = await request(app)
            .post('/api/register')
            .send({
                firstName: 'first',
                lastName: 'last',
                street: 'street',
                streetNumber: '1',
                plz: '78224',
                city: 'city',
                email: 'fIrSt.laSt@test.de',
                password: 'test',
            })
            .expect(409); // Expecting conflict

        expect(response.body.code).toBe(409);
        expect(mockUsers).toHaveLength(1);
        expect(mockSessions).toHaveLength(1);
    });

    it('should not login a unregistered user', async () => {
        await request(app)
            .post('/api/login')
            .send({
                email: 'first.last@test.de',
                password: 'test'
            })
            .expect(401);
    });

    it('should not login a registered user with wrong password', async () => {
        mockUsers.push({ email: 'first.last@test.de', password: bcrypt.hashSync('test', 10) });

        const response = await request(app)
            .post('/api/login')
            .send({
                email: 'first.last@test.de',
                password: 'falsch'
            })
            .expect(401);

        expect(response.body.message).toMatch('Falsches Passwort');
    });

    it('login user successfully with exact same email', async () => {
        mockUsers.push({ email: 'first.last@test.de', password: bcrypt.hashSync('test', 10) });

        await request(app)
            .post('/api/login')
            .send({
                email: 'first.last@test.de',
                password: 'test'
            })
            .expect(200);

        expect(mockUsers).toHaveLength(1);
        expect(mockSessions).toHaveLength(1);
    });

    it('login user successfully with different upper/lower case email', async () => {
        mockUsers.push({ email: 'fIRsT.lAsT@tEst.de', password: bcrypt.hashSync('test', 10) });

        await request(app)
            .post('/api/login')
            .send({
                email: 'fIrst.laSt@test.de',
                password: 'test'
            })
            .expect(200);

        expect(mockUsers).toHaveLength(1);
        expect(mockSessions).toHaveLength(1);
    });

    it('logout logged-in user', async () => {
        mockUsers.push({ userId: 1, email: 'fIRsT.lAsT@tEst.de', password: bcrypt.hashSync('test', 10) });

        await request(app)
            .post('/api/login')
            .send({
                email: 'first.last@test.de',
                password: 'test'
            })
            .expect(200);

        await request(app)
            .delete('/api/logout')
            .set('Cookie', [`sessionId=${mockSessions[0].sessionId}`])
            .send({})
            .expect(200);
    });

});

//Tests laufen alle bestanden durch
//Verstehe leider nicht warum bei mir (VScode) unter Problems folgendes erscheint:
//Cannot find name 'jest'.
//Cannot find name 'it'. Do you need to install type definitions for a test runner? Try `npm i --save-dev @types/jest` or `npm i --save-dev @types/mocha`.
//Cannot find name 'expect'.
//Würde ich gerne wissen, Dokumentation und die vorgeschlagen sachen mit npm install.. zu machen hat leider auch nicht geholfen