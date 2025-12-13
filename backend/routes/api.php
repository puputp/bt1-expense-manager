<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ExpenseController;

Route::get('/ping', function () {
    return response()->json(['message' => 'API OK']);
});

Route::get('/expenses', [ExpenseController::class, 'index']);
Route::post('/expenses', [ExpenseController::class, 'store']);
Route::patch('/expenses/{id}/toggle', [ExpenseController::class, 'toggle']);
Route::delete('/expenses/{id}', [ExpenseController::class, 'destroy']);
