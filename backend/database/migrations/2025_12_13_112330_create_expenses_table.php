<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
{
    Schema::create('expenses', function (Blueprint $table) {
        $table->id();
        $table->string('title');
        $table->decimal('amount', 12, 2)->default(0);
        $table->string('type')->default('chi'); // chi | thu
        $table->boolean('is_paid')->default(false); // đã thanh toán chưa
        $table->timestamps();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('expenses');
    }
};
