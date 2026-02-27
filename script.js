// 宇宙星系背景
const canvas = document.getElementById('universe');
const ctx = canvas.getContext('2d');

let width, height;
let stars = [];
let galaxies = [];
let shootingStars = [];

function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
}

class Star {
    constructor() {
        this.reset();
    }
    
    reset() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.z = Math.random() * 2000;
        this.size = Math.random() * 2;
        this.opacity = Math.random() * 0.8 + 0.2;
        this.twinkleSpeed = Math.random() * 0.02 + 0.01;
        this.twinklePhase = Math.random() * Math.PI * 2;
    }
    
    update() {
        this.z -= 2;
        this.twinklePhase += this.twinkleSpeed;
        
        if (this.z <= 0) {
            this.reset();
            this.z = 2000;
        }
    }
    
    draw() {
        const x = (this.x - width / 2) * (1000 / this.z) + width / 2;
        const y = (this.y - height / 2) * (1000 / this.z) + height / 2;
        const size = this.size * (1000 / this.z);
        const opacity = this.opacity * (1 - this.z / 2000) * (0.5 + 0.5 * Math.sin(this.twinklePhase));
        
        if (x > 0 && x < width && y > 0 && y < height) {
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
            ctx.fill();
        }
    }
}

class Galaxy {
    constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.radius = Math.random() * 100 + 50;
        this.rotation = 0;
        this.rotationSpeed = (Math.random() - 0.5) * 0.002;
        this.hue = Math.random() * 60 + 180; // 蓝紫色调
        this.particles = [];
        
        for (let i = 0; i < 50; i++) {
            const angle = (i / 50) * Math.PI * 2;
            const dist = Math.random() * this.radius;
            this.particles.push({
                angle: angle,
                distance: dist,
                speed: 0.001 + Math.random() * 0.002
            });
        }
    }
    
    update() {
        this.rotation += this.rotationSpeed;
        this.particles.forEach(p => {
            p.angle += p.speed;
        });
    }
    
    draw() {
        this.particles.forEach(p => {
            const x = this.x + Math.cos(p.angle + this.rotation) * p.distance;
            const y = this.y + Math.sin(p.angle + this.rotation) * p.distance * 0.6; // 椭圆效果
            
            ctx.beginPath();
            ctx.arc(x, y, 1, 0, Math.PI * 2);
            ctx.fillStyle = `hsla(${this.hue}, 70%, 60%, 0.6)`;
            ctx.fill();
        });
        
        // 星系核心
        const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius);
        gradient.addColorStop(0, `hsla(${this.hue}, 70%, 50%, 0.3)`);
        gradient.addColorStop(1, 'transparent');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
    }
}

class ShootingStar {
    constructor() {
        this.reset();
    }
    
    reset() {
        this.x = Math.random() * width;
        this.y = 0;
        this.length = Math.random() * 80 + 20;
        this.speed = Math.random() * 10 + 5;
        this.angle = Math.PI / 4;
        this.opacity = 1;
        this.active = false;
    }
    
    trigger() {
        this.active = true;
        this.reset();
    }
    
    update() {
        if (!this.active) return;
        
        this.x += Math.cos(this.angle) * this.speed;
        this.y += Math.sin(this.angle) * this.speed;
        this.opacity -= 0.01;
        
        if (this.opacity <= 0 || this.x > width || this.y > height) {
            this.active = false;
        }
    }
    
    draw() {
        if (!this.active) return;
        
        const tailX = this.x - Math.cos(this.angle) * this.length;
        const tailY = this.y - Math.sin(this.angle) * this.length;
        
        const gradient = ctx.createLinearGradient(this.x, this.y, tailX, tailY);
        gradient.addColorStop(0, `rgba(0, 212, 255, ${this.opacity})`);
        gradient.addColorStop(1, 'transparent');
        
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(tailX, tailY);
        ctx.stroke();
    }
}

function init() {
    resize();
    
    // 创建星星
    for (let i = 0; i < 300; i++) {
        stars.push(new Star());
    }
    
    // 创建星系
    for (let i = 0; i < 3; i++) {
        galaxies.push(new Galaxy());
    }
    
    // 创建流星
    for (let i = 0; i < 2; i++) {
        shootingStars.push(new ShootingStar());
    }
}

function animate() {
    ctx.fillStyle = 'rgba(2, 2, 4, 0.3)';
    ctx.fillRect(0, 0, width, height);
    
    // 绘制星星
    stars.forEach(star => {
        star.update();
        star.draw();
    });
    
    // 绘制星系
    galaxies.forEach(galaxy => {
        galaxy.update();
        galaxy.draw();
    });
    
    // 随机触发流星
    if (Math.random() < 0.005) {
        const inactive = shootingStars.find(s => !s.active);
        if (inactive) inactive.trigger();
    }
    
    shootingStars.forEach(star => {
        star.update();
        star.draw();
    });
    
    requestAnimationFrame(animate);
}

window.addEventListener('resize', resize);
init();
animate();

// 数字滚动动画
const statValues = document.querySelectorAll('.stat-value');
const observerOptions = {
    threshold: 0.5,
    rootMargin: '0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const target = parseInt(entry.target.dataset.count);
            let current = 0;
            const increment = target / 50;
            const timer = setInterval(() => {
                current += increment;
                if (current >= target) {
                    entry.target.textContent = target + (target === 999 ? '+' : '');
                    clearInterval(timer);
                } else {
                    entry.target.textContent = Math.floor(current);
                }
            }, 30);
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

statValues.forEach(stat => observer.observe(stat));

// 平滑滚动
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// 导航栏滚动效果
let lastScroll = 0;
const nav = document.querySelector('.nav');

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll > 100) {
        nav.style.background = 'rgba(2, 2, 4, 0.95)';
        nav.style.borderBottomColor = 'rgba(0, 212, 255, 0.3)';
    } else {
        nav.style.background = 'rgba(2, 2, 4, 0.8)';
        nav.style.borderBottomColor = 'rgba(0, 212, 255, 0.1)';
    }
    
    lastScroll = currentScroll;
});

// 鼠标视差效果
document.addEventListener('mousemove', (e) => {
    const mouseX = e.clientX / width - 0.5;
    const mouseY = e.clientY / height - 0.5;
    
    const orbits = document.querySelectorAll('.orbit');
    orbits.forEach((orbit, index) => {
        const speed = (index + 1) * 10;
        orbit.style.transform = `translate(-50%, -50%) translate(${mouseX * speed}px, ${mouseY * speed}px)`;
    });
});

// 作品卡片悬停效果
const workItems = document.querySelectorAll('.work-item');
workItems.forEach(item => {
    item.addEventListener('mouseenter', () => {
        item.style.borderColor = '#00d4ff';
    });
    item.addEventListener('mouseleave', () => {
        item.style.borderColor = 'rgba(0, 212, 255, 0.2)';
    });
});

console.log('%c 🌌 EGSEY UNIVERSE ', 'background: linear-gradient(135deg, #00d4ff, #b829dd); color: #000; font-size: 24px; font-weight: bold; padding: 15px 30px; border-radius: 10px;');
console.log('%c 系统初始化完成 | 欢迎来到数字宇宙 ', 'color: #00d4ff; font-size: 14px;');
