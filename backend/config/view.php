<?php

return [

    /*
    |--------------------------------------------------------------------------
    | View Storage Paths
    |--------------------------------------------------------------------------
    */
    'paths' => [
        resource_path('views'),
    ],

    /*
    |--------------------------------------------------------------------------
    | Compiled View Path
    |--------------------------------------------------------------------------
    | IMPORTANT: Không dùng realpath() vì trên môi trường build (Railway)
    | có thể trả về false => gây lỗi "View path not found".
    */
    'compiled' => env('VIEW_COMPILED_PATH', storage_path('framework/views')),

];
