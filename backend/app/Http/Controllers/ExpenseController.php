<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Expense;

class ExpenseController extends Controller
{
    // GET /api/expenses
    public function index()
    {
        return response()->json(
            Expense::orderByDesc("id")->get()
        );
    }

    // POST /api/expenses
    public function store(Request $request)
    {
        $data = $request->validate([
            "title" => "required|string|max:255",
            "amount" => "required|numeric|min:0",
            "type" => "required|in:chi,thu",
        ]);

        $expense = Expense::create([
            "title" => $data["title"],
            "amount" => $data["amount"],
            "type" => $data["type"],
            "is_paid" => false
        ]);

        return response()->json($expense, 201);
    }

    // PATCH /api/expenses/{id}/toggle
    public function toggle($id)
    {
        $expense = Expense::findOrFail($id);
        $expense->is_paid = !$expense->is_paid;
        $expense->save();

        return response()->json($expense);
    }

    // DELETE /api/expenses/{id}
    public function destroy($id)
    {
        $expense = Expense::findOrFail($id);
        $expense->delete();

        return response()->json(["message" => "Deleted"]);
    }
}
