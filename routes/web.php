<?php

use App\Http\Controllers\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Admin\ModuleController as AdminModuleController;
use App\Http\Controllers\Admin\ProjectController as AdminProjectController;
use App\Http\Controllers\Admin\PermissionController as AdminPermissionController;
use App\Http\Controllers\Admin\RoleController as AdminRoleController;
use App\Http\Controllers\Admin\UserController as AdminUserController;
use App\Http\Controllers\Admin\WorkerController as AdminWorkerController;
use App\Http\Controllers\ActivityLogController;
use App\Http\Controllers\ExpenseCategoryController;
use App\Http\Controllers\ExpenseController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\PosController;
use App\Http\Controllers\ProductCategoryController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\StockController;
use App\Http\Controllers\ModuleController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\InvoiceController;
use App\Http\Controllers\SaleController;
use App\Http\Controllers\SupplierController;
use App\Http\Controllers\TaskController;
use App\Http\Controllers\Hr\WorkerController as HrWorkerController;
use App\Http\Controllers\Hr\ContractController as HrContractController;
use App\Http\Controllers\Hr\SalaryController as HrSalaryController;
use App\Http\Controllers\Hr\AttendanceController as HrAttendanceController;
use App\Http\Controllers\Hr\VacationController as HrVacationController;
use App\Http\Controllers\Hr\CnssRecordController as HrCnssRecordController;
use App\Http\Controllers\EmployeeNoteController;
use App\Http\Controllers\PurchaseController;
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
        Route::get('/users', [AdminUserController::class, 'index'])->name('users.index');
        Route::get('/users/create', [AdminUserController::class, 'create'])->name('users.create');
        Route::post('/users', [AdminUserController::class, 'store'])->name('users.store');
        Route::post('/users/{user}/reset-password', [AdminUserController::class, 'resetPassword'])->name('users.reset-password');
        Route::post('/users/{user}/block', [AdminUserController::class, 'block'])->name('users.block');
        Route::post('/users/{user}/unblock', [AdminUserController::class, 'unblock'])->name('users.unblock');
        Route::resource('permissions', AdminPermissionController::class)->except(['show']);
        Route::resource('roles', AdminRoleController::class)->except(['show']);
        Route::get('/workers', [AdminWorkerController::class, 'index'])->name('workers.index');
        Route::post('/workers', [AdminWorkerController::class, 'store'])->name('workers.store');
        Route::delete('/workers/{project_user}', [AdminWorkerController::class, 'destroy'])->name('workers.destroy');
        Route::get('/modules', [AdminModuleController::class, 'index'])->name('modules.index');
        Route::get('/modules/{project}/edit', [AdminModuleController::class, 'edit'])->name('modules.edit');
        Route::patch('/modules/{project}', [AdminModuleController::class, 'update'])->name('modules.update');
        Route::get('/projects/{project}/edit', [AdminProjectController::class, 'edit'])->name('projects.edit');
        Route::patch('/projects/{project}', [AdminProjectController::class, 'update'])->name('projects.update');
    });

    Route::prefix('projects')->name('projects.')->group(function () {
        Route::get('/', [ProjectController::class, 'index'])->name('index');
        Route::get('/create', [ProjectController::class, 'create'])->name('create');
        Route::post('/', [ProjectController::class, 'store'])->name('store');

        Route::prefix('{project}')->middleware('project.access')->group(function () {
            Route::get('/', [ProjectController::class, 'show'])->name('show');

            Route::prefix('workers')->name('workers.')->group(function () {
                Route::get('/', [ProjectWorkerController::class, 'index'])->name('index');
                Route::post('/', [ProjectWorkerController::class, 'store'])->name('store');
                Route::patch('/{worker}', [ProjectWorkerController::class, 'update'])->name('update');
                Route::delete('/{worker}', [ProjectWorkerController::class, 'destroy'])->name('destroy');
            });

            Route::get('/roles', [ProjectRoleController::class, 'index'])->name('roles.index');

            Route::prefix('notes')->name('notes.')->group(function () {
                Route::get('/', [EmployeeNoteController::class, 'index'])->name('index');
                Route::post('/', [EmployeeNoteController::class, 'store'])->name('store');
            });

            Route::prefix('modules/logs')->name('modules.logs.')->middleware('project.module:logs')->group(function () {
                Route::get('/', [ActivityLogController::class, 'index'])->name('index');
            });

            Route::prefix('modules/tasks')->name('modules.tasks.')->middleware('project.module:tasks')->group(function () {
                Route::get('/', [TaskController::class, 'index'])->name('index');
                Route::get('/my-tasks', [TaskController::class, 'myTasks'])->name('my-tasks');
                Route::post('/', [TaskController::class, 'store'])->name('store');
                Route::post('/{task}/complete', [TaskController::class, 'complete'])->name('complete');
                Route::delete('/{task}', [TaskController::class, 'destroy'])->name('destroy');
            });

            Route::prefix('modules/payments')->name('modules.payments.')->middleware('project.module:payments')->group(function () {
                Route::get('/', [PaymentController::class, 'index'])->name('index');
                Route::patch('/{payment}', [PaymentController::class, 'update'])->name('update');
                Route::delete('/{payment}', [PaymentController::class, 'destroy'])->name('destroy');
                Route::post('/{payment}/refund', [PaymentController::class, 'refund'])->name('refund');
                Route::post('/{payment}/reinstate', [PaymentController::class, 'reinstate'])->name('reinstate');
            });

            Route::prefix('modules/stock')->name('modules.stock.')->middleware('project.module:stock')->group(function () {
                Route::get('/', [StockController::class, 'index'])->name('index');
                Route::get('/movements', [StockController::class, 'movements'])->name('movements');
                Route::post('/{product}/adjust', [StockController::class, 'adjust'])->name('adjust');
            });

            Route::prefix('modules/products')->name('modules.products.')->middleware('project.module:products')->group(function () {
                Route::get('/', [ProductController::class, 'index'])->name('index');
                Route::post('/', [ProductController::class, 'store'])->name('store');
                Route::patch('/{product}', [ProductController::class, 'update'])->name('update');
                Route::delete('/{product}', [ProductController::class, 'destroy'])->name('destroy');
                Route::prefix('categories')->name('categories.')->group(function () {
                    Route::get('/', [ProductCategoryController::class, 'index'])->name('index');
                    Route::post('/', [ProductCategoryController::class, 'store'])->name('store');
                    Route::patch('/{category}', [ProductCategoryController::class, 'update'])->name('update');
                    Route::delete('/{category}', [ProductCategoryController::class, 'destroy'])->name('destroy');
                });
            });

            Route::prefix('modules/pos')->name('modules.pos.')->middleware('project.module:pos')->group(function () {
                Route::get('/', [PosController::class, 'index'])->name('index');
                Route::post('/session/open', [PosController::class, 'openSession'])->name('session.open');
                Route::post('/session/{posSession}/close', [PosController::class, 'closeSession'])->name('session.close');
                Route::post('/orders', [PosController::class, 'createOrder'])->name('orders.store');
                Route::post('/orders/{order}/payments', [PosController::class, 'addPayment'])->name('orders.payments.store');
                Route::post('/orders/{order}/complete', [PosController::class, 'completeOrder'])->name('orders.complete');
                Route::post('/orders/{order}/cancel', [PosController::class, 'cancelOrder'])->name('orders.cancel');
            });

            Route::prefix('modules/sales')->name('modules.sales.')->middleware('project.module:sales')->group(function () {
                Route::get('/', [SaleController::class, 'index'])->name('index');
                Route::get('/create', [SaleController::class, 'create'])->name('create');
                Route::post('/', [SaleController::class, 'store'])->name('store');
                Route::get('/{sale}', [SaleController::class, 'show'])->name('show');
                Route::post('/{sale}/pay', [SaleController::class, 'pay'])->name('pay');
                Route::post('/{sale}/invoice', [InvoiceController::class, 'createFromSale'])->name('invoice.create');
                Route::get('/{sale}/invoice/pdf', [InvoiceController::class, 'pdf'])->name('invoice.pdf');
                Route::post('/{sale}/invoice/send', [InvoiceController::class, 'send'])->name('invoice.send');
            });

            Route::prefix('modules/suppliers')->name('modules.suppliers.')->middleware('project.module:suppliers')->group(function () {
                Route::get('/', [SupplierController::class, 'index'])->name('index');
                Route::post('/', [SupplierController::class, 'store'])->name('store');
                Route::get('/{supplier}', [SupplierController::class, 'show'])->name('show');
                Route::patch('/{supplier}', [SupplierController::class, 'update'])->name('update');
                Route::delete('/{supplier}', [SupplierController::class, 'destroy'])->name('destroy');
            });

            Route::prefix('modules/hr')->name('modules.hr.')->middleware('project.module:hr')->group(function () {
                Route::get('/', fn (\Illuminate\Http\Request $r) => redirect()->route('projects.modules.hr.workers.index', ['project' => $r->route('project')]))->name('index');
                Route::get('/attendance', [HrAttendanceController::class, 'projectIndex'])->name('attendance.index');
                Route::prefix('workers')->name('workers.')->group(function () {
                    Route::get('/', [HrWorkerController::class, 'index'])->name('index');
                    Route::post('/', [HrWorkerController::class, 'store'])->name('store');
                    Route::get('/{worker}', [HrWorkerController::class, 'show'])->name('show');
                    Route::patch('/{worker}', [HrWorkerController::class, 'update'])->name('update');
                    Route::delete('/{worker}', [HrWorkerController::class, 'destroy'])->name('destroy');
                    Route::post('/{worker}/contracts', [HrContractController::class, 'store'])->name('contracts.store');
                    Route::patch('/contracts/{contract}', [HrContractController::class, 'update'])->name('contracts.update');
                    Route::delete('/contracts/{contract}', [HrContractController::class, 'destroy'])->name('contracts.destroy');
                    Route::post('/{worker}/salaries/generate', [HrSalaryController::class, 'generate'])->name('salaries.generate');
                    Route::post('/salaries/{salary}/pay', [HrSalaryController::class, 'pay'])->name('salaries.pay');
                    Route::patch('/salaries/{salary}', [HrSalaryController::class, 'update'])->name('salaries.update');
                    Route::delete('/salaries/{salary}', [HrSalaryController::class, 'destroy'])->name('salaries.destroy');
                    Route::get('/{worker}/attendances', [HrAttendanceController::class, 'index'])->name('attendances.index');
                    Route::post('/{worker}/attendances', [HrAttendanceController::class, 'store'])->name('attendances.store');
                    Route::post('/{worker}/attendances/bulk', [HrAttendanceController::class, 'storeBulk'])->name('attendances.storeBulk');
                    Route::delete('/attendances/{attendance}', [HrAttendanceController::class, 'destroy'])->name('attendances.destroy');
                    Route::post('/{worker}/vacations', [HrVacationController::class, 'store'])->name('vacations.store');
                    Route::delete('/vacations/{vacation}', [HrVacationController::class, 'destroy'])->name('vacations.destroy');
                    Route::post('/{worker}/cnss-records', [HrCnssRecordController::class, 'store'])->name('cnss.store');
                });
                Route::post('/vacations/{vacation}/approve', [HrVacationController::class, 'approve'])->name('vacations.approve');
                Route::post('/vacations/{vacation}/reject', [HrVacationController::class, 'reject'])->name('vacations.reject');
                Route::patch('/cnss-records/{cnssRecord}', [HrCnssRecordController::class, 'update'])->name('cnss.update');
                Route::delete('/cnss-records/{cnssRecord}', [HrCnssRecordController::class, 'destroy'])->name('cnss.destroy');
            });

            Route::prefix('modules/purchase')->name('modules.purchase.')->middleware('project.module:purchase')->group(function () {
                Route::get('/', [PurchaseController::class, 'index'])->name('index');
                Route::get('/create', [PurchaseController::class, 'create'])->name('create');
                Route::post('/', [PurchaseController::class, 'store'])->name('store');
                Route::get('/{order}', [PurchaseController::class, 'show'])->name('show');
                Route::get('/{order}/edit', [PurchaseController::class, 'edit'])->name('edit');
                Route::patch('/{order}', [PurchaseController::class, 'update'])->name('update');
                Route::post('/{order}/receive', [PurchaseController::class, 'receive'])->name('receive');
                Route::patch('/{order}/bill', [PurchaseController::class, 'updateBill'])->name('bill');
                Route::post('/{order}/send', [PurchaseController::class, 'send'])->name('send');
                Route::post('/{order}/cancel', [PurchaseController::class, 'cancel'])->name('cancel');
            });

            Route::prefix('modules/expenses')->name('modules.expenses.')->middleware('project.module:expenses')->group(function () {
                Route::get('/', [ExpenseController::class, 'index'])->name('index');
                Route::post('/', [ExpenseController::class, 'store'])->name('store');
                Route::patch('/{expense}', [ExpenseController::class, 'update'])->name('update');
                Route::post('/{expense}/pay', [ExpenseController::class, 'pay'])->name('pay');
                Route::prefix('categories')->name('categories.')->group(function () {
                    Route::get('/', [ExpenseCategoryController::class, 'index'])->name('index');
                    Route::post('/', [ExpenseCategoryController::class, 'store'])->name('store');
                    Route::patch('/{category}', [ExpenseCategoryController::class, 'update'])->name('update');
                    Route::delete('/{category}', [ExpenseCategoryController::class, 'destroy'])->name('destroy');
                });
            });

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
