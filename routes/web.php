<?php

use App\Http\Controllers\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Admin\PermissionController as AdminPermissionController;
use App\Http\Controllers\Admin\RoleController as AdminRoleController;
use App\Http\Controllers\Admin\WorkerController as AdminWorkerController;
use App\Http\Controllers\ModuleController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\ProjectRoleController;
use App\Http\Controllers\ProjectWorkerController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', fn () => redirect()->route('projects.index'))->name('dashboard');

    Route::prefix('admin')->name('admin.')->middleware('admin')->group(function () {
        Route::get('/', AdminDashboardController::class)->name('dashboard');
        Route::resource('permissions', AdminPermissionController::class)->except(['show']);
        Route::resource('roles', AdminRoleController::class)->except(['show']);
        Route::get('/workers', [AdminWorkerController::class, 'index'])->name('workers.index');
        Route::post('/workers', [AdminWorkerController::class, 'store'])->name('workers.store');
        Route::delete('/workers/{project_user}', [AdminWorkerController::class, 'destroy'])->name('workers.destroy');
    });

    Route::prefix('projects')->name('projects.')->group(function () {
        Route::get('/', [ProjectController::class, 'index'])->name('index');
        Route::get('/create', [ProjectController::class, 'create'])->name('create');
        Route::post('/', [ProjectController::class, 'store'])->name('store');

        Route::prefix('{project}')->middleware('project.access')->group(function () {
            Route::get('/', [ProjectController::class, 'show'])->name('show');
            Route::get('/edit', [ProjectController::class, 'edit'])->name('edit');
            Route::patch('/', [ProjectController::class, 'update'])->name('update');

            Route::prefix('workers')->name('workers.')->group(function () {
                Route::get('/', [ProjectWorkerController::class, 'index'])->name('index');
                Route::post('/', [ProjectWorkerController::class, 'store'])->name('store');
                Route::patch('/{worker}', [ProjectWorkerController::class, 'update'])->name('update');
                Route::delete('/{worker}', [ProjectWorkerController::class, 'destroy'])->name('destroy');
            });

            Route::get('/roles', [ProjectRoleController::class, 'index'])->name('roles.index');

            Route::prefix('modules/{module}')->name('modules.')->middleware('project.module')->group(function () {
                Route::get('/', [ModuleController::class, '__invoke'])->name('show');
            });
        });
    });
});

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__ . '/auth.php';
