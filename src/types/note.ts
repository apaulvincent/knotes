export interface Category {
    id: string;
    name: string;
    count: number;
    userId: string; // New: Link to user
    createdAt: any;
}

export interface Note {
    id: string;
    title: string;
    content: string;
    categoryIds: string[];
    tags: string[];
    isPinned: boolean;
    userId: string; // New: Link to user
    createdAt: any;
    updatedAt: any;
}
