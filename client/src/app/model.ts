// export interface User {
//     name: string;
//     email: string;
//     products: Product[];
// }

export interface Listing {
    // productID: string;
    listingTitle: string;
    pictures: string; //link to mongodb, mongodb stored array of links to picture
    description: string;
    category: string;
    subCategory: string;
    listed?: boolean;
    specificMatch: boolean;
}