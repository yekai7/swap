export interface User {
    name: string;
    email: string;
    products: Product[];
}

export interface Product {
    name: string;
    listed: boolean;
}