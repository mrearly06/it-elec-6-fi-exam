export interface Comment {
    _id: string;
    postId: string;
    userId: string; // Add this line
    comment: string;
    username:string;
    // other fields...
  }