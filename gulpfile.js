var gulp         = require('gulp'),
		sass         = require('gulp-sass'),
		browserSync  = require('browser-sync'),
		concat       = require('gulp-concat'),
		uglify       = require('gulp-uglify-es').default,
		cleancss     = require('gulp-clean-css'),
		autoprefixer = require('gulp-autoprefixer'),
		rsync        = require('gulp-rsync'),
		newer        = require('gulp-newer'),
		rename       = require('gulp-rename'),
		replace 	 = require("gulp-replace"),
		rigger 		 = require('gulp-rigger'),
		imagemin 	 = require("gulp-imagemin"),
		del          = require('del');

// Local Server
gulp.task('browser-sync', function() {
	browserSync({
		server: {
			baseDir: 'dist'
		},
		notify: false,
		// online: false, // Work offline without internet connection
		// tunnel: true, tunnel: 'projectname', // Demonstration page: http://projectname.localtunnel.me
	})
});
function bsReload(done) { browserSync.reload(); done(); };

// Custom Styles
gulp.task('styles', function() {
	return gulp.src('app/sass/**/*.sass')
	.pipe(sass({
		outputStyle: 'expanded',
		includePaths: [__dirname + '/node_modules']
	}))
	.pipe(concat('styles.min.css'))
	.pipe(autoprefixer({
		grid: true,
		overrideBrowserslist: ['last 10 versions']
	}))
	// .pipe(cleancss( {level: { 1: { specialComments: 0 } } })) // Optional. Comment out when debugging
	.pipe(gulp.dest('dist/css'))
	.pipe(browserSync.stream())
});

// html
gulp.task('html', function() {
	return gulp.src('app/**/**/*.html')
	.pipe(replace("dist/"))
	.pipe(rigger())
	// .pipe(cleancss( {level: { 1: { specialComments: 0 } } })) // Optional. Comment out when debugging
	.pipe(gulp.dest('dist/'))
	.pipe(browserSync.stream())
});
//img
gulp.task('img', function() {
	return gulp.src('app/img/**/*.{jpg,jpeg,png,gif}')
	.pipe(imagemin([
	    imagemin.gifsicle({interlaced: true}),
	    imagemin.jpegtran({progressive: true}),
	    imagemin.optipng({optimizationLevel: 5}),
	    imagemin.svgo({
	        plugins: [
	            {removeViewBox: true},
	            {cleanupIDs: false}
	        ]
	    })
		]))
	.pipe(gulp.dest('dist/img'))
});
// Scripts & JS Libraries
gulp.task('scripts', function() {
	return gulp.src([
		// 'node_modules/jquery/dist/jquery.min.js', // Optional jQuery plug-in (npm i --save-dev jquery)
		'app/js/_libs.js', // JS libraries (all in one)
		'app/js/_custom.js', // Custom scripts. Always at the end
		])
	.pipe(concat('scripts.min.js'))
	// .pipe(uglify()) // Minify js (opt.)
	.pipe(gulp.dest('dist/js'))
	.pipe(browserSync.reload({ stream: true }))
});


// Code & Reload
gulp.task('code', function() {
	return gulp.src('app/**/*.html')
	.pipe(browserSync.reload({ stream: true }))
});

// Deploy
gulp.task('rsync', function() {
	return gulp.src('app/')
	.pipe(rsync({
		root: 'app/',
		hostname: 'username@yousite.com',
		destination: 'yousite/public_html/',
		// include: ['*.htaccess'], // Included files
		exclude: ['**/Thumbs.db', '**/*.DS_Store'], // Excluded files
		recursive: true,
		archive: true,
		silent: false,
		compress: true
	}))
});

gulp.task('watch', function() {
	gulp.watch(['app/js/_custom.js', 'app/js/_libs.js'], gulp.parallel('scripts'));
	gulp.watch('app/*.html', gulp.parallel('code'));
	gulp.watch('app/*.html', gulp.parallel('html'));
	gulp.watch('app/img/**/**', gulp.parallel('img'));
	gulp.watch('app/sass/*.sass', gulp.parallel('styles'));
	// gulp.watch('app/img/_src/**/*', gulp.parallel('img'));
});

gulp.task('default', gulp.parallel('html','img','styles', 'scripts', 'browser-sync', 'watch'));
