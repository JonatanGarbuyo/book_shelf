const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const config = require('./config/config').get(process.env.NODE_ENV);

// to use Promises with mongoose:
mongoose.Promise = global.Promise;
//mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);
mongoose.connect(config.DATABASE,{ useNewUrlParser: true });

// 
const { User } = require('./models/user');
const { Book } = require('./models/book');
const { auth } = require('./middlewares/auth');


const app = express();
// register middlewares
app.use(bodyParser.json());
app.use(cookieParser());

app.user(express.static('client/build'));


//// GET ////
app.get('/api/auth', auth, (req, res)=>{
    res.json({
        isAuth:true,
        id:req.user._id,
        email:req.user.email,
        name:req.user.name,
        lastname:req.user.lastname
    });
});

app.get('/api/logout', auth, (req, res)=>{
    req.user.deleteToken(req.token, (error, user)=>{
        if(error) return res.status(400).send(error);
        res.sendStatus(200);
    });
});

app.get('/api/getBook', (req, res)=>{
    let id = req.query.id;

    Book.findById(id, (error, doc)=>{
        if(error) return res.status(400).send(error);
        res.send(doc);

    });
});

app.get('/api/books', (req, res)=>{
    let skip = parseInt(req.query.skip);
    let limit = parseInt(req.query.limit);
    let order = req.query.order;
    
    Book.find().skip(skip).sort({_id:order}).limit(limit).exec((error, doc)=>{
        if(error) return res.status(400).send(error);
        res.send(doc);
    });
});

app.get('/api/getReviewer', (req, res)=>{
    let id = req.query.id;

    User.findById(id, (error, doc)=>{
        if(error) return res.status(400).send(error);
        res.json({
            name: doc.name,
            lastname: doc.lastname
        });
    });
});

app.get('/api/users', (req, res)=>{
    User.find({}, (error, users)=>{
        if(error) return res.status(400).send(error);
        res.status(200).send(users);
    });
});

app.get('/api/user_posts',(req, res)=>{
    Book.find({ownerId:req.query.user}).exec((error, docs)=>{
        if(error) return res.status(400).send(error);
        res.send(docs);
    });
});




//// POST ////
app.post('/api/book', (req, res)=>{
    const book = new Book(req.body);

    book.save((error, doc)=>{
        if(error) return res.status(400).send(error);
        res.status(200).json({
            post:true,
            bookID:doc._id
        });
    });
});

app.post('/api/register', (req, res)=>{
    const user = new User(req.body);

    user.save((error, doc)=>{
        if(error) return res.json({success:false});
        res.status(200).json({
            success:true,
            user:doc
        });
    });
});

app.post('/api/login',(req, res)=>{
    User.findOne({'email':req.body.email}, (error, user)=>{
        if(!user) return res.json({isAuth:false, message:"Auth failed, email not found"});

        user.comparePassword(req.body.password, (error, isMatch)=>{
            if(!isMatch) return res.json({
                isAuth:false,
                message:"Wrong password"
            });

            user.generateToken((error, user)=>{
                if(error) return status(400).send(error);

                res.cookie('auth', user.token).json({
                    isAuth:true,
                    id:user._id,
                    email:user.email
                });
            });
        });
    });
});

//// UPDATE ////
app.post('/api/book_update', (req, res)=>{
    Book.findByIdAndUpdate(req.body._id, req.body, {new:true}, (error, doc)=>{
        if(error) return res.status(400).send(error);
        res.json({
            success:true,
            doc
        });
    });
});



//// DELETE ////
app.delete('/api/delete_book', (req, res)=>{
    let id = req.query.id;

    Book.findByIdAndRemove(id, (error, doc)=>{
        if(error) return res.status(400).send(error);
        res.json(true);
    });
});



if (process.env.NODE_ENV === 'production') {
    const path = require('path');
    app.get('/*', (req, res)=>{
        res.sendfile(path.resolve(__dirname, '../client', 'build', 'index.html'))
    })
}

const port = process.env.PORT || 3001;
app.listen(port,()=>{
    console.log(`Server running on port ${port}`);
});