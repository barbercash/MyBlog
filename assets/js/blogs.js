let posts = [];
let postId = 0;

// Load sample posts on page load
document.addEventListener('DOMContentLoaded', function() {
    loadSamplePosts();
    renderPosts();
});

function loadSamplePosts() {
    const samplePosts = [
        {
            id: postId++,
            title: "Getting Started with Web Development",
            content: "A beginner's guide to learning web development in 2024. Covering HTML, CSS, JavaScript, and modern frameworks.",
            date: "March 15, 2024"
        },
        {
            id: postId++,
            title: "The Future of Technology",
            content: "Exploring emerging technologies and their potential impact on our daily lives and society as a whole.",
            date: "March 10, 2024"
        },
        {
            id: postId++,
            title: "Building Better User Experiences",
            content: "Tips and best practices for creating intuitive and accessible user interfaces that delight users.",
            date: "March 5, 2024"
        }
    ];
    
    posts = [...samplePosts];
}

function toggleNewPostForm() {
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

function createPost() {
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
    
    posts.unshift(newPost); // Add to beginning of array
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
        <div class="blog-card" data-id="${post.id}" onclick="viewPost(${post.id})">
            <h3>${escapeHtml(post.title)}</h3>
            <p>${escapeHtml(post.content.length > 150 ? post.content.substring(0, 150) + '...' : post.content)}</p>
            <div class="blog-date">${post.date}</div>
        </div>
    `).join('');
    
    blogGrid.innerHTML = postsHtml;
}

// Helper function to escape HTML characters
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// View individual post
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
    
    // Create post view HTML
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
    
    // Insert after the section title
    const sectionTitle = blogSection.querySelector('.section-title');
    sectionTitle.insertAdjacentHTML('afterend', postViewHtml);
    
    // Scroll to top of blog section
    blogSection.scrollIntoView({ behavior: 'smooth' });
}

function backToBlog() {
    // Remove post view
    const postView = document.getElementById('postView');
    if (postView) {
        postView.remove();
    }
    
    // Show blog grid and controls
    document.getElementById('blogGrid').style.display = 'grid';
    document.querySelector('button[onclick="toggleNewPostForm()"]').style.display = 'inline-block';
}