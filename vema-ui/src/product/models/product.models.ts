export interface ProductImage {
  image: string;
  alt_text: string;
}

export interface Category {
  id: number;
  name: string;
}

export interface Product {
  id: number;
  title: string;
  description: string;
  price: number;
  category: Category;
  stock: number;
  images: ProductImage[];
  created_at: string;
}

export interface ProductPage {
  count: number;
  next: string | null;
  previous: string | null;
  results: any[]; // Replace 'any' with your Product interface
}
