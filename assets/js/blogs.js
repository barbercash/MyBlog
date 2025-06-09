// blogs.js - Version without ES6 modules
console.log('blogs.js loaded successfully'); // Debug line

// Firebase will be loaded via CDN scripts in HTML
// Make sure you have these scripts in your HTML before blogs.js:
/*
<script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-analytics-compat.js"></script>
*/

// Your Firebase config (replace with your actual config)
const firebaseConfig = {
    apiKey: "AIzaSyC5nt7cRJ45IAfqNW2qdHIVWwSPVxfin7M",
    authDomain: "my-blog-3a17d.firebaseapp.com",
    projectId: "my-blog-3a17d",
    storageBucket: "my-blog-3a17d.firebasestorage.app",
    messagingSenderId: "718509051314",
    appId: "1:718509051314:web:410b70a02da8e51c69e8ab",
    measurementId: "G-HCE8E6YZDG"
  };
// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const analytics = firebase.analytics();

let posts = [];
let postId = 0;

// Load posts from Firebase on page load
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, calling loadPostsFromFirebase');
    loadPostsFromFirebase();
});

async function loadPostsFromFirebase() {
    console.log('loadPostsFromFirebase called');
    try {
        const snapshot = await db.collection('posts').orderBy('timestamp', 'desc').get();
        posts = [];
        
        snapshot.forEach(doc => {
            const data = doc.data();
            posts.push({
                id: data.id,
                title: data.title,
                content: data.content,
                date: data.date,
                firebaseId: doc.id
            });
        });
        
        // Set postId to highest ID + 1
        postId = posts.length > 0 ? Math.max(...posts.map(p => p.id)) + 1 : 0;
        
        renderPosts();
    } catch (error) {
        console.error('Error loading posts:', error);
        alert('Error loading posts. Check your Firebase configuration.');
    }
}

async function savePostToFirebase(post) {
    try {
        await db.collection('posts').add({
            id: post.id,
            title: post.title,
            content: post.content,
            date: post.date,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });
    } catch (error) {
        console.error('Error saving post:', error);
        alert('Error saving post. Please try again.');
    }
}

async function deletePostFromFirebase(postId) {
    try {
        // Find the post in local array to get Firebase ID
        const post = posts.find(p => p.id === postId);
        if (!post || !post.firebaseId) {
            throw new Error('Post not found or missing Firebase ID');
        }
        
        // Delete from Firebase
        await db.collection('posts').doc(post.firebaseId).delete();
        
        // Remove from local array
        posts = posts.filter(p => p.id !== postId);
        
        // Re-render posts
        renderPosts();
        
        console.log('Post deleted successfully');
    } catch (error) {
        console.error('Error deleting post:', error);
        alert('Error deleting post. Please try again.');
    }
}

function toggleNewPostForm() {
    console.log('toggleNewPostForm called'); // Debug line
    const form = document.getElementById('newPostForm');
    form.style.display = form.style.display === 'none' || form.style.display === '' ? 'block' : 'none';
    
    if (form.style.display === 'block') {
        document.getElementById('postTitle').focus();
    } else {
        // Clear form when hiding
        document.getElementById('postTitle').value = '';
        document.getElementById('postContent').value = '';
    }
}

async function createPost() {
    console.log('createPost called'); // Debug line
    const title = document.getElementById('postTitle').value.trim();
    const content = document.getElementById('postContent').value.trim();
    
    if (!title || !content) {
        alert('Please fill in both title and content');
        return;
    }
    
    const newPost = {
        id: postId++,
        title: title,
        content: content,
        date: new Date().toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        })
    };
    
    // Save to Firebase
    await savePostToFirebase(newPost);
    
    // Add to local array and render
    posts.unshift(newPost);
    renderPosts();
    toggleNewPostForm();
    
    // Smooth scroll to the new post
    setTimeout(() => {
        const newPostElement = document.querySelector('.blog-card');
        if (newPostElement) {
            newPostElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            newPostElement.style.animation = 'fadeInUp 0.6s ease';
        }
    }, 100);
}

function renderPosts() {
    const blogGrid = document.getElementById('blogGrid');
    
    if (!blogGrid) {
        console.error('blogGrid element not found');
        return;
    }
    
    const postsHtml = posts.map(post => `
        <div class="blog-card" data-id="${post.id}">
            <div class="blog-card-header">
                <h3 onclick="viewPost(${post.id})" style="cursor: pointer; margin: 0; flex-grow: 1;">${escapeHtml(post.title)}</h3>
                <button class="delete-btn" onclick="confirmDeletePost(${post.id})" title="Delete post">×</button>
            </div>
            <p onclick="viewPost(${post.id})" style="cursor: pointer;">${escapeHtml(post.content.length > 150 ? post.content.substring(0, 150) + '...' : post.content)}</p>
            <div class="blog-date" onclick="viewPost(${post.id})" style="cursor: pointer;">${post.date}</div>
        </div>
    `).join('');
    
    blogGrid.innerHTML = postsHtml;
}

function viewPost(id) {
    const post = posts.find(p => p.id === id);
    if (!post) {
        alert('Post not found');
        return;
    }
    
    // Hide the blog grid and form
    document.getElementById('blogGrid').style.display = 'none';
    document.getElementById('newPostForm').style.display = 'none';
    document.querySelector('button[onclick="toggleNewPostForm()"]').style.display = 'none';
    
    // Create and show post view
    showPostView(post);
}

function showPostView(post) {
    const blogSection = document.getElementById('blog');
    
    const postViewHtml = `
        <div id="postView" class="post-view">
            <button class="btn btn-secondary back-btn" onclick="backToBlog()">← Back to Blog</button>
            <article class="full-post">
                <h1>${escapeHtml(post.title)}</h1>
                <div class="post-meta">
                    <span class="post-date">${post.date}</span>
                </div>
                <div class="post-content">
                    ${escapeHtml(post.content).replace(/\n/g, '<br>')}
                </div>
            </article>
        </div>
    `;
    
    const sectionTitle = blogSection.querySelector('.section-title');
    sectionTitle.insertAdjacentHTML('afterend', postViewHtml);
    
    blogSection.scrollIntoView({ behavior: 'smooth' });
}

function backToBlog() {
    const postView = document.getElementById('postView');
    if (postView) {
        postView.remove();
    }
    
    document.getElementById('blogGrid').style.display = 'grid';
    document.querySelector('button[onclick="toggleNewPostForm()"]').style.display = 'inline-block';
}

function confirmDeletePost(postId) {
    const post = posts.find(p => p.id === postId);
    if (!post) {
        alert('Post not found');
        return;
    }
    
    // Show confirmation dialog
    if (confirm(`Are you sure you want to delete "${post.title}"?\n\nThis action cannot be undone.`)) {
        deletePostFromFirebase(postId);
    }
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}