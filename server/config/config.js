// dev variables
const config = {
    production:{
        SECRET:process.env.SECRET,
        DATABASE:process.env.MONGODB_URI
    },
    default:{
        SECRET:"cLn(w7^bZG!KwJc{q48Lt@+wd",
        DATABASE:'mongodb://localhost:27017/booksShelf'
    }
}

exports.get = function(env){
    return config[env] || config.default;
}