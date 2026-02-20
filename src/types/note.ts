export interface Attachment {
    name: string;
    url: string;
    type: string;
    size: number;
}

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
    categoryId: string;
    tags: string[];
    isPinned: boolean;
    userId: string; // New: Link to user
    attachments?: Attachment[];
    createdAt: any;
    updatedAt: any;
}
