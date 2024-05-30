const validator = require('validator');
const bcrypt = require('bcrypt');
const UserModel = require('../models/User');
const ThemeModel = require('../models/Theme');

// GET: 회원가입 페이지 반환
exports.signupPage = async (req, res) => {
    try {
        const themes = await ThemeModel.findAll(); // 테마 목록 불러오기
        res.render("Signup/signup", { themes });
    } catch (error) {
        res.status(500).json({ error: 'Failed to load signup page' });
    }
};

// POST: 회원가입 데이터 처리
exports.signup = async (req, res) => {
    const { email, password, username, nickname, job, gender, age, themes } = req.body;

    // 입력 데이터 검증
    if (!email || !password || !username || !nickname || !job || !gender || !age) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    // 이메일 형식 검증
    if (!validator.isEmail(email)) {
        return res.status(400).json({ error: '올바른 이메일 주소를 입력하세요.' });
    }

    // 비밀번호 검증
    if (password.length < 8 || !/\d/.test(password) || !/[a-zA-Z]/.test(password)) {
        return res.status(400).json({ error: 'Password must be at least 8 characters long and include both letters and numbers.' });
    }

    // gender 값을 변환
    const genderValue = gender === '남' ? 'male' : gender === '여' ? 'female' : '';

    try {
        const hashedPassword = await bcrypt.hash(password, 10); // 비밀번호 해싱 

        const user = {
            email,
            password: hashedPassword,
            username,
            nickname,
            job,
            gender: genderValue,
            age,
        };

        const memberId = await UserModel.createUser(user);
        
        for (const themeId of themes) {
            await UserModel.addPreference(memberId, themeId);
        }

        res.status(201).json({ message: 'User created successfully', memberId });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// GET: 로그인 페이지 반환
exports.loginPage = (req, res) => {
    res.render('Login/login');
};

// POST: 로그인 데이터 처리
exports.login = async (req, res) => {
    const { email, password } = req.body;

    // 이메일과 비밀번호의 길이 확인
    if (email.length > 255 || password.length > 255) {
        return res.status(400).json({ error: '이메일 또는 비밀번호의 길이가 허용된 길이를 초과했습니다.' });
    }

    // 이메일 형식 검증
    if (!validator.isEmail(email)) {
        return res.status(400).json({ error: '올바른 이메일 주소를 입력하세요.' });
    }

    try {
        // 입력된 이메일로 사용자 찾기
        const user = await UserModel.findByEmail(email);

        // 사용자가 존재하지 않는 경우
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // 비밀번호가 일치하지 않는 경우
        const passwordMatch = await bcrypt.compare(password, user.password); // 비밀번호 비교
        if (!passwordMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // 로그인 성공 시, 세션에 사용자 정보 저장
        req.session.user = {
            id: user.member_id,
            email: user.email,
            username: user.username
        };

        // 로그인 성공
        return res.status(200).json({ message: 'Login successful' });
        //res.redirect('/'); // 로그인 성공 후 메인 페이지로 리디렉션
    } catch (error) {
        console.error("로그인 중 오류:", error);
        res.status(500).json({ error: 'Failed to log in' });
    }
};
