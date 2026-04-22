class Game {
    constructor() {
        console.log("FFA Game Initializing...");
        try {
            this.initData();
            this.isBusy = false;
            
            this.logContainer = document.getElementById('log-container');
            this.heroImg = document.getElementById('hero-img');
            this.monsterImg = document.getElementById('monster-img');
            this.monsterLabel = document.getElementById('monster-label');
            this.heroLabel = document.getElementById('hero-label');
            this.locationName = document.getElementById('location-name');

            // Data Definitions
            this.monsters = {
                plains: [
                    { name: 'シャドウスライム', hp: 20, atk: 5, exp: 3, gold: 5, img: 'assets/slime.png' },
                    { name: '野良シャドウ', hp: 15, atk: 7, exp: 4, gold: 8, img: 'assets/slime.png' }
                ],
                forest: [
                    { name: 'シャドウナイト', hp: 60, atk: 15, exp: 20, gold: 40, img: 'assets/knight.png' },
                    { name: '森の番人', hp: 80, atk: 12, exp: 25, gold: 50, img: 'assets/knight.png' }
                ],
                hell: [
                    { name: 'アビス・デモン', hp: 250, atk: 45, exp: 150, gold: 300, img: 'assets/demon.png' },
                    { name: '地獄の亡者', hp: 180, atk: 35, exp: 100, gold: 200, img: 'assets/knight.png' }
                ]
            };

            this.weapons = [
                { name: '錆びた剣', atk: 5, price: 100 },
                { name: '鋼鉄の剣', atk: 15, price: 500 },
                { name: '光の聖剣', atk: 50, price: 2500 },
                { name: 'アビス・ブレード', atk: 120, price: 10000 }
            ];

            this.jobs = [
                { name: '駆け出し', hpMult: 1, atkMult: 1, reqLevel: 1 },
                { name: '戦士', hpMult: 1.2, atkMult: 1.5, reqLevel: 10 },
                { name: '騎士', hpMult: 1.5, atkMult: 2.0, reqLevel: 30 },
                { name: '魔王狩り', hpMult: 2.5, atkMult: 4.0, reqLevel: 60 }
            ];

            this.updateUI();
            this.renderShop();
            this.renderJobs();
            this.updateBackground();

            console.log("FFA Game Initialized Successfully.");
        } catch (e) {
            console.error("FFA Game Initialization Failed:", e);
        }
    }

    initData() {
        const saved = localStorage.getItem('ffa_save_v2');
        if (saved) {
            this.player = JSON.parse(saved);
        } else {
            this.player = {
                name: '冒険者',
                job: '駆け出し',
                level: 1,
                hp: 100,
                hpMax: 100,
                atkBase: 10,
                def: 5,
                gold: 0,
                exp: 0,
                expNext: 10,
                weapon: { name: '素手', atk: 0 },
                area: 'plains'
            };
        }
    }

    saveData() {
        localStorage.setItem('ffa_save_v2', JSON.stringify(this.player));
    }

    resetData() {
        if (confirm('データを初期化しますか？')) {
            localStorage.removeItem('ffa_save_v2');
            location.reload();
        }
    }

    addLog(text, type = 'info') {
        const entry = document.createElement('div');
        entry.className = `log-entry log-${type}`;
        entry.textContent = text;
        this.logContainer.appendChild(entry);
        this.logContainer.scrollTop = this.logContainer.scrollHeight;
    }

    get totalAtk() {
        const job = this.jobs.find(j => j.name === this.player.job) || this.jobs[0];
        return Math.floor((this.player.atkBase + this.player.weapon.atk) * job.atkMult);
    }

    updateUI() {
        document.getElementById('p-name').textContent = this.player.name;
        this.heroLabel.textContent = this.player.name;
        document.getElementById('p-job').textContent = this.player.job;
        document.getElementById('p-level').textContent = this.player.level;
        document.getElementById('p-hp').textContent = Math.floor(this.player.hp);
        document.getElementById('p-hp-max').textContent = this.player.hpMax;
        document.getElementById('p-gold').textContent = `${this.player.gold} G`;
        document.getElementById('p-exp').textContent = this.player.exp;
        document.getElementById('p-exp-next').textContent = this.player.expNext;
        document.getElementById('p-weapon').textContent = `${this.player.weapon.name} (+${this.player.weapon.atk})`;
        
        const hpPercent = (this.player.hp / this.player.hpMax) * 100;
        document.getElementById('hp-bar').style.width = `${hpPercent}%`;
        
        document.getElementById('area-select').value = this.player.area;
        this.locationName.textContent = document.querySelector(`#area-select option[value="${this.player.area}"]`).textContent;
    }

    updateBackground() {
        document.body.className = `area-${this.player.area}`;
    }

    changeArea(area) {
        this.player.area = area;
        this.updateBackground();
        this.updateUI();
        this.addLog(`エリアを「${this.locationName.textContent}」に変更しました。`, 'info');
        this.saveData();
    }

    toggleModal(id) {
        const modal = document.getElementById(id);
        modal.style.display = modal.style.display === 'flex' ? 'none' : 'flex';
        if (id === 'shop-modal') this.renderShop();
        if (id === 'job-modal') this.renderJobs();
    }

    renderShop() {
        const container = document.getElementById('shop-items');
        container.innerHTML = '';
        this.weapons.forEach((w, i) => {
            const div = document.createElement('div');
            div.className = 'list-item';
            div.innerHTML = `
                <div class="item-info">
                    <h4>${w.name}</h4>
                    <p>攻撃力 +${w.atk}</p>
                </div>
                <button class="buy-btn" onclick="game.buyWeapon(${i})" ${this.player.gold < w.price ? 'disabled' : ''}>
                    ${w.price} G
                </button>
            `;
            container.appendChild(div);
        });
    }

    buyWeapon(index) {
        const w = this.weapons[index];
        if (this.player.gold >= w.price) {
            this.player.gold -= w.price;
            this.player.weapon = { ...w };
            this.addLog(`${w.name}を購入し装備しました！`, 'gain');
            this.updateUI();
            this.renderShop();
            this.saveData();
        }
    }

    renderJobs() {
        const container = document.getElementById('job-items');
        container.innerHTML = '';
        this.jobs.forEach((j, i) => {
            const isUnlocked = this.player.level >= j.reqLevel;
            const isCurrent = this.player.job === j.name;
            const div = document.createElement('div');
            div.className = 'list-item';
            div.innerHTML = `
                <div class="item-info">
                    <h4>${j.name} ${isCurrent ? '(現在)' : ''}</h4>
                    <p>Lv${j.reqLevel}以上 / HP x${j.hpMult} / ATK x${j.atkMult}</p>
                </div>
                <button class="buy-btn" onclick="game.changeJob(${i})" ${!isUnlocked || isCurrent ? 'disabled' : ''}>
                    ${isCurrent ? '就業中' : '転職'}
                </button>
            `;
            container.appendChild(div);
        });
    }

    changeJob(index) {
        const job = this.jobs[index];
        this.player.job = job.name;
        this.addLog(`${job.name}に転職しました！ステータスが向上します。`, 'level');
        this.updateUI();
        this.renderJobs();
        this.saveData();
    }

    async battle() {
        if (this.isBusy || this.player.hp <= 0) {
            if (this.player.hp <= 0) this.addLog('HPが足りません！休憩してください。', 'battle');
            return;
        }

        this.isBusy = true;
        this.setButtonsDisabled(true);

        try {
            const areaMonsters = this.monsters[this.player.area];
            const monsterData = areaMonsters[Math.floor(Math.random() * areaMonsters.length)];
            const monster = { ...monsterData };
            
            this.monsterImg.src = monster.img;
            this.monsterLabel.textContent = monster.name;
            this.monsterImg.classList.add('monster-entering');
            this.addLog(`${monster.name}が現れた！`, 'info');

            await new Promise(r => setTimeout(r, 300));
            this.monsterImg.classList.remove('monster-entering');

            let win = false;
            const pAtk = this.totalAtk;

            for (let turn = 1; turn <= 20; turn++) {
                // Player
                const dmg = Math.max(1, pAtk - Math.floor(Math.random() * (pAtk/4)));
                monster.hp -= dmg;
                this.addLog(`あなたの攻撃！ ${monster.name}に ${dmg} のダメージ！`, 'battle');
                this.monsterImg.classList.add('shake', 'damage-flash');
                setTimeout(() => this.monsterImg.classList.remove('shake', 'damage-flash'), 150);
                await new Promise(r => setTimeout(r, 80));

                if (monster.hp <= 0) { win = true; break; }

                // Monster
                const mDmg = Math.max(1, monster.atk - Math.floor(this.player.def / 2) - Math.floor(Math.random() * 3));
                this.player.hp -= mDmg;
                this.addLog(`${monster.name}の攻撃！ あなたは ${mDmg} のダメージを受けた！`, 'battle');
                this.heroImg.classList.add('shake', 'damage-flash');
                setTimeout(() => this.heroImg.classList.remove('shake', 'damage-flash'), 150);
                this.updateUI();
                await new Promise(r => setTimeout(r, 80));

                if (this.player.hp <= 0) { this.player.hp = 0; break; }
            }

            if (win) {
                this.addLog(`${monster.name}を倒した！`, 'gain');
                this.gainExp(monster.exp);
                this.gainGold(monster.gold);
                
                // Treasure Chest Logic
                if (Math.random() < 0.2) {
                    const bonus = Math.floor(monster.gold * 2);
                    this.addLog(`宝箱を発見！ ${bonus} G を追加で手に入れた！`, 'gain');
                    this.player.gold += bonus;
                }

                this.monsterImg.style.opacity = '0';
                setTimeout(() => { this.monsterImg.style.opacity = '1'; }, 500);
            } else if (this.player.hp <= 0) {
                this.addLog('あなたは力尽きた...', 'battle');
            } else {
                this.addLog(`${monster.name}は逃げ出した。`, 'info');
            }

            this.saveData();
            this.updateUI();
        } finally {
            this.isBusy = false;
            this.setButtonsDisabled(false);
        }
    }

    async rest() {
        if (this.isBusy) return;
        this.isBusy = true;
        this.setButtonsDisabled(true);
        try {
            const heal = Math.floor(this.player.hpMax * 0.7);
            this.player.hp = Math.min(this.player.hpMax, this.player.hp + heal);
            this.addLog(`宿屋で休憩した。HPが ${heal} 回復した。`, 'info');
            await new Promise(r => setTimeout(r, 200));
            this.updateUI();
            this.saveData();
        } finally {
            this.isBusy = false;
            this.setButtonsDisabled(false);
        }
    }

    setButtonsDisabled(disabled) {
        ['btn-battle', 'btn-rest', 'btn-shop', 'btn-job'].forEach(id => {
            const btn = document.getElementById(id);
            if (btn) btn.disabled = disabled;
        });
    }

    gainExp(amount) {
        this.player.exp += amount;
        this.addLog(`${amount} の経験値を獲得。`, 'gain');
        if (this.player.exp >= this.player.expNext) this.levelUp();
    }

    gainGold(amount) {
        this.player.gold += amount;
        this.addLog(`${amount} G を手に入れた。`, 'gain');
    }

    levelUp() {
        this.player.level++;
        this.player.exp -= this.player.expNext;
        this.player.expNext = Math.floor(this.player.expNext * 1.6);
        
        const hpUp = 20 + Math.floor(Math.random() * 10);
        const atkUp = 3 + Math.floor(Math.random() * 2);

        this.player.hpMax += hpUp;
        this.player.hp = this.player.hpMax;
        this.player.atkBase += atkUp;

        this.addLog(`レベルアップ！ レベル ${this.player.level} になった！`, 'level');
        this.addLog(`HP最大値+${hpUp}、基礎攻撃力+${atkUp}`, 'level');
        if (this.player.exp >= this.player.expNext) this.levelUp();
    }
}

window.addEventListener('DOMContentLoaded', () => {
    window.game = new Game();
});
