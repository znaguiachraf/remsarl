<?php

namespace App\Providers;

use App\Models\ExpenseCategory;
use App\Models\PosOrder;
use App\Models\PosSession;
use App\Models\Project;
use App\Models\Sale;
use App\Models\StockMovement;
use App\Observers\ExpenseCategoryObserver;
use App\Policies\PosOrderPolicy;
use App\Policies\PosSessionPolicy;
use App\Policies\SalePolicy;
use App\Policies\StockPolicy;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Gate::policy(Sale::class, SalePolicy::class);
        Gate::policy(StockMovement::class, StockPolicy::class);
        Gate::policy(PosSession::class, PosSessionPolicy::class);
        Gate::policy(PosOrder::class, PosOrderPolicy::class);

        Gate::define('pos.openSession', [PosSessionPolicy::class, 'openSession']);
        Gate::define('pos.createOrder', [PosOrderPolicy::class, 'createOrder']);

        Vite::prefetch(concurrency: 3);
        ExpenseCategory::observe(ExpenseCategoryObserver::class);
    }
}
