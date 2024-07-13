const express = require('express')
const app = express()
const cookieParser = require('cookie-parser')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')

const userModel = require('./models/user')
const postModel = require('./models/post')

app.set('view engine', "ejs")

app.use(cookieParser())
app.use(express.static('public'))
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

function islogin(req, res, next) {
    if (req.cookies.token === "") res.send('Please login')
    else {
        let data = jwt.verify(req.cookies.token, 'SECRET')
        req.user = data;
        next()
    }
}
app.get('/', (req, res) => {
    res.render('index')
})
app.get('/create', (req, res) => {
    res.render('create')
})

app.post('/create', async (req, res) => {
    const { name, email, password } = req.body
    let user = await userModel.findOne({ email: email })
    if (user) {
        return res.send('User already exists')
    }
    bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(password, salt, async (err, hash) => {
            let user = await userModel.create({
                name,
                email,
                password: hash
            })
            let token = jwt.sign({ email: email }, 'SECRET')
            res.cookie('token', token)
            res.redirect('/')
        })
    })
}
)

app.get('/login', (req, res) => {
    res.render('login')
})

app.post('/login', async (req, res) => {
    const { name, email, password } = req.body
    let user = await userModel.findOne({ email: email })
    if (!user) {
        return res.send('User does not exists')
    }
    bcrypt.compare(password, user.password, (err, result) => {
        if (result) {
            let token = jwt.sign({ email: email }, 'SECRET')
            res.cookie('token', token)
            res.redirect('/profile')
        } else {
            res.send('Invalid info')
        }
    })
})

app.get('/profile', islogin, async (req, res) => {
    let user = await userModel.findOne({ email: req.user.email }).populate('posts')
    console.log(user);
    res.render('profile', { user })
})

app.get('/logout', (req, res) => {
    res.clearCookie('token')
    res.redirect('/')
})

app.post('/posted', islogin, async (req, res) => {
    const { content } = req.body
    let user = await userModel.findOne({ email: req.user.email })
    let post = await postModel.create({
        name: user._id,
        content,
    })
    user.posts.push(post._id)
    await user.save()
    res.redirect('/profile')
})
app.get('/like/:id', islogin, async (req, res) => {
    let post = await postModel.findOne({ _id: req.params.id }).populate('user')

    if (post.likes.indexOf(req.user.userid) === -1) {
        post.likes.push(req.user.userid)

    } else {
        post.likes.splice(post.likes.indexOf(req.user.userid), 1)
    }
    await post.save()
    res.redirect('/profile')
})
app.get('/edit/:id', islogin, async (req, res) => {
    let post = await postModel.findOne({ _id: req.params.id }).populate('user')


    res.render('Edit', { post })
})
app.post('/update/:id', islogin, async (req, res) => {
    let post = await postModel.findOneAndUpdate({ _id: req.params.id },{content: req.body.content})
    res.redirect('/profile')
})



app.post('/update/:id', islogin, async (req, res) => {
    let post = await postModel.findOneAndUpdate({ _id: req.params.id }).populate('user')

    res.render('edit', { post })
})

app.listen(3000, () => {
    console.log('Server is running on port 3000')
})