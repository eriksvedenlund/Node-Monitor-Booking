function loggedOut(req, res, next){
	if(req.session && req.session.userId){
		return res.redirect('/profile');
	}
	return next();
}

function requiresLogin(req, res, next){
	if(req.session && req.session.userId){
		return next();
	}
	else{
		var err = new Error('You must be logged in to view this page');
		err.status = 401;
		return next(err);
	}
}

// unique admin ID in db only in my computer, not optimal..
function requiresAdmin(req, res, next){
	if(req.session.userId === '587f6112cb5ad128c4d1f6f9'){
		return next();
	}
	else{
		var err = new Error('You must be admin to view this page');
		err.status = 401;
		return next(err);
	}
}

module.exports.requiresAdmin = requiresAdmin;
module.exports.loggedOut = loggedOut;
module.exports.requiresLogin = requiresLogin;
