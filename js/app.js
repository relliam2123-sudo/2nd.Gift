(() => {
    const LETTER = `My dearest Ms Future R,

Sixty-eight roses, because one would never be enough. Each petal is a small thank-you for every quiet day you made brighter.

Keep this bouquet close. It never wilts, and it only grows redder when you smile.

Always yours R.`;

    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
    const PAL = ['#b3122a', '#8f0d20', '#d1213d', '#a10f25', '#c4162f'];
    const ROSE = '#cc1530';
    const Y = new THREE.Vector3(0, 1, 0);
    document.getElementById('themeBtn')?.remove(); // the blue theme is gone

    const canvas = document.getElementById('scene');
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
    scene.add(new THREE.AmbientLight(0xffe4d8, 0.55));
    scene.add(new THREE.HemisphereLight(0xffd0c4, 0x3a0610, 0.4));
    const key = new THREE.DirectionalLight(0xffe8c0, 1.1); key.position.set(3, 5, 6); scene.add(key);
    const fill = new THREE.DirectionalLight(0xffffff, 0.5); fill.position.set(-4, 4, 5); scene.add(fill);
    const rim = new THREE.PointLight(0xff2a45, 0.9, 14); rim.position.set(-4, 2, 3); scene.add(rim);
    const glow = new THREE.PointLight(0xd9ac52, 0.8, 10); glow.position.set(0, 1.5, 2.5); scene.add(glow);

    const bouq = new THREE.Group(); scene.add(bouq);

    const floor = new THREE.Mesh(new THREE.CircleGeometry(4.4, 64), new THREE.MeshStandardMaterial({ color: 0x3a060d, roughness: 1 }));
    floor.rotation.x = -Math.PI / 2; floor.position.y = -2.65; scene.add(floor);
    const ring = new THREE.Mesh(new THREE.RingGeometry(4.3, 4.37, 64), new THREE.MeshBasicMaterial({ color: 0xd9ac52, side: THREE.DoubleSide }));
    ring.rotation.x = -Math.PI / 2; ring.position.y = -2.64; scene.add(ring);

    const N = 68, C = new THREE.Vector3(0, 0, 0), R = 1.75, B = new THREE.Vector3(0, -2.4, 0);
    const sph = new THREE.SphereGeometry(1, 12, 8); sph.translate(0, 1, 0);
    const ball = new THREE.SphereGeometry(1, 10, 8);
    const m = new THREE.Matrix4(), pm = new THREE.Matrix4(), tmp = new THREE.Matrix4();
    const q = new THREE.Quaternion(), col = new THREE.Color(), one = new THREE.Vector3(1, 1, 1);
    const rnd = (a, b) => a + Math.random() * (b - a);
    const dirOf = (pol, az) => new THREE.Vector3(Math.sin(pol) * Math.cos(az), Math.cos(pol), Math.sin(pol) * Math.sin(az));

    function curved(wd, cup, curl, bend, sx = 12, sy = 8) {
        const g = new THREE.PlaneGeometry(1, 1, sx, sy), P = g.attributes.position, cs = [];
        for (let i = 0; i < P.count; i++) {
            const u = P.getX(i) * 2, v = P.getY(i) + 0.5;
            const w = wd * Math.pow(Math.sin(Math.PI * (0.05 + 0.8 * v)), 0.55);
            const lip = Math.pow(Math.max(0, v - 0.6) / 0.4, 2);
            const ruf = 0.035 * lip * Math.sin(u * 9 + v * 6);
            P.setXYZ(i, u * w, v * (1 - 0.1 * u * u) + 0.012 * lip * Math.sin(u * 11),
                -cup * u * u * (0.25 + 0.75 * v) + bend * v * v + curl * lip * Math.abs(u) + ruf);
            const vein = 0.05 * Math.pow(Math.abs(Math.sin(u * 7 + v * 2)), 6);
            const b = clamp(0.4 + 0.6 * Math.pow(v, 0.8) + 0.12 * lip * Math.abs(u) - vein, 0, 1);
            cs.push(b, b * (1 - 0.1 * lip), b * (1 - 0.1 * lip));
        }
        g.setAttribute('color', new THREE.Float32BufferAttribute(cs, 3)); g.computeVertexNormals();
        return g;
    }

    const roseMat = new THREE.MeshStandardMaterial({ vertexColors: true, color: ROSE, roughness: 0.38, metalness: 0.12, side: THREE.DoubleSide, emissive: 0x1a0206 });
    const VAR = [
        { geo: curved(0.56, 0.32, 0.6, 0.28), n: 9, tilt: [1.1, 1.32], L: 0.48, r0: 0.045, off: 0, light: 0.01 },
        { geo: curved(0.52, 0.5, 0.45, 0.2), n: 8, tilt: [0.8, 1.0], L: 0.44, r0: 0.04, off: 0.2, light: 0 },
        { geo: curved(0.5, 0.75, 0.3, 0.1), n: 7, tilt: [0.5, 0.68], L: 0.38, r0: 0.03, off: 0.45, light: -0.03 },
        { geo: curved(0.46, 1.1, 0.08, 0), n: 6, tilt: [0.2, 0.34], L: 0.31, r0: 0.02, off: 0.7, light: -0.06 },
        { geo: curved(0.42, 1.5, 0, 0), n: 5, tilt: [0.03, 0.08], L: 0.2, r0: 0.01, off: 1.1, light: -0.1 }
    ];
    const layers = VAR.map(v => new THREE.InstancedMesh(v.geo, roseMat, N * v.n));
    const greenMat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.65, side: THREE.DoubleSide });
    const sepals = new THREE.InstancedMesh(curved(0.2, 0.2, 0.3, -0.1, 4, 6), greenMat, N * 5);
    const hips = new THREE.InstancedMesh(ball, new THREE.MeshStandardMaterial({ color: 0x2f5a30, roughness: 0.6 }), N);
    const stemMat = new THREE.MeshStandardMaterial({ color: 0x2c4a22, roughness: 0.8 });
    const stemGeo = new THREE.CylinderGeometry(0.028, 0.04, 1, 6); stemGeo.translate(0, 0.5, 0);
    const stems = new THREE.InstancedMesh(stemGeo, stemMat, N);
    const DN = 90, dew = new THREE.InstancedMesh(ball, new THREE.MeshStandardMaterial({ color: 0xffeeee, roughness: 0.05, metalness: 0.1, transparent: true, opacity: 0.75 }), DN);
    const dq = new THREE.Quaternion(); let dn = 0;

    // deep wine cup under the roses, so any gap between the heads reads as shadow, never as a hole
    const cup = new THREE.Mesh(new THREE.SphereGeometry(R - 0.12, 40, 24, 0, Math.PI * 2, 0, 2.3),
        new THREE.MeshStandardMaterial({ color: 0x3a0610, emissive: 0x1c0206, roughness: 1, side: THREE.DoubleSide }));
    cup.position.copy(C); bouq.add(cup);

    for (let i = 0; i < N; i++) {
        const pol = 1.75 * Math.sqrt((i + 0.5) / N), az = i * 2.39996;
        const d = dirOf(pol, az), p = C.clone().addScaledVector(d, R);
        q.setFromUnitVectors(Y, d);
        const sc = rnd(0.7, 0.8), open = rnd(0.88, 1.12), spin = rnd(0, 6.28), tone = rnd(0.86, 1);
        const fm = new THREE.Matrix4().compose(p, q, new THREE.Vector3(sc, sc, sc));
        VAR.forEach((v, vi) => {
            for (let j = 0; j < v.n; j++) {
                const a = spin + v.off + j * Math.PI * 2 / v.n + rnd(-0.12, 0.12);
                const tilt = rnd(v.tilt[0], v.tilt[1]) * (vi < 2 ? open : 1), L = v.L * rnd(0.92, 1.08);
                pm.makeRotationY(a).multiply(tmp.makeTranslation(0, 0, v.r0)).multiply(tmp.makeRotationX(tilt)).multiply(tmp.makeScale(L, L, L));
                layers[vi].setMatrixAt(i * v.n + j, m.multiplyMatrices(fm, pm));
                layers[vi].setColorAt(i * v.n + j, col.setScalar(clamp((0.9 + v.light * 2.6 + rnd(-0.08, 0.06)) * tone, 0.4, 1)));
                if (vi === 0 && dn < DN && Math.random() < 0.3) { // a dew drop resting on this outer petal
                    const u = rnd(-0.5, 0.5), vv = rnd(0.35, 0.75), r = rnd(0.018, 0.03);
                    const pt = new THREE.Vector3(u * 0.5, vv, -0.32 * u * u * (0.25 + 0.75 * vv) + 0.28 * vv * vv + 0.015).applyMatrix4(m);
                    dew.setMatrixAt(dn++, tmp.compose(pt, dq, new THREE.Vector3(r, r, r)));
                }
            }
        });
        for (let j = 0; j < 5; j++) {
            pm.makeRotationY(spin + j * 1.2566 + rnd(-0.2, 0.2)).multiply(tmp.makeRotationX(rnd(2.0, 2.5))).multiply(tmp.makeScale(0.3, 0.3, 0.3));
            sepals.setMatrixAt(i * 5 + j, m.multiplyMatrices(fm, pm));
            sepals.setColorAt(i * 5 + j, col.set(0x2f5a30).offsetHSL(0, 0, rnd(-0.03, 0.05)));
        }
        pm.makeTranslation(0, -0.03, 0).multiply(tmp.makeScale(0.09, 0.07, 0.09));
        hips.setMatrixAt(i, m.multiplyMatrices(fm, pm));

        const dir = p.clone().sub(B), len = dir.length(); dir.normalize();
        q.setFromUnitVectors(Y, dir);
        stems.setMatrixAt(i, m.compose(B, q, new THREE.Vector3(1, len, 1)));
    }
    dew.count = dn;
    bouq.add(...layers, sepals, hips, stems, dew);

    const leaves = new THREE.InstancedMesh(curved(0.26, 0.15, 0.15, 0.12, 6, 8), greenMat, 40);
    for (let i = 0; i < 40; i++) {
        const d = dirOf(rnd(1.5, 1.75), i * Math.PI * 2 / 40 + rnd(-0.08, 0.08)), s = rnd(0.6, 0.85);
        q.setFromUnitVectors(Y, d);
        const fm = new THREE.Matrix4().compose(C.clone().addScaledVector(d, R - 0.12), q, one);
        pm.makeRotationY(rnd(0, 6.28)).multiply(tmp.makeRotationX(rnd(0.1, 0.5))).multiply(tmp.makeScale(s, s, s));
        leaves.setMatrixAt(i, m.multiplyMatrices(fm, pm));
        leaves.setColorAt(i, col.set(0x2f6b3a).offsetHSL(0, 0, rnd(-0.04, 0.05)));
    }
    bouq.add(leaves);

    const FMAX = 520, puff = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 6, 5), new THREE.MeshStandardMaterial({ color: 0xf7ecdf, roughness: 0.9 }), FMAX); let fi = 0;
    for (let c = 0; c < 34; c++) {
        const ctr = C.clone().addScaledVector(dirOf(rnd(1.45, 1.85), rnd(0, 6.28)), R + rnd(0.1, 0.25));
        for (let j = 0; j < 15; j++) {
            const s = rnd(0.025, 0.045);
            puff.setMatrixAt(fi, m.compose(ctr.clone().add(new THREE.Vector3(rnd(-1, 1), rnd(-1, 1), rnd(-1, 1)).multiplyScalar(0.13)), q.identity(), new THREE.Vector3(s, s, s)));
            puff.setColorAt(fi++, col.setScalar(rnd(0.85, 1)));
        }
    }
    bouq.add(puff);

    function cone(r0, y0, r1, y1, pw, amp, folds, nu, nv, ph, mat) {
        const pos = [], uv = [], idx = [];
        for (let j = 0; j <= nv; j++) {
            const v = j / nv;
            for (let i = 0; i <= nu; i++) {
                const a = i / nu * Math.PI * 2;
                const fold = Math.pow(Math.abs(Math.sin(a * folds / 2 + ph)), 0.7) - 0.5;
                const r = (r0 + (r1 - r0) * Math.pow(v, pw)) * (1 + amp * v * v * fold);
                const y = y0 + (y1 - y0) * v + amp * 0.8 * v * v * v * Math.sin(a * folds + ph * 2);
                pos.push(Math.cos(a) * r, y, Math.sin(a) * r); uv.push(i / nu, v);
            }
        }
        for (let j = 0; j < nv; j++) for (let i = 0; i < nu; i++) { const a = j * (nu + 1) + i, b = a + nu + 1; idx.push(a, b, a + 1, b, b + 1, a + 1); }
        const g = new THREE.BufferGeometry();
        g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
        g.setIndex(idx); g.computeVertexNormals();
        return new THREE.Mesh(g, mat);
    }
    const paperMat = new THREE.MeshStandardMaterial({ color: 0xece0d2, roughness: 0.85, emissive: 0x1a1412, side: THREE.DoubleSide });
    const paper2Mat = new THREE.MeshStandardMaterial({ color: 0xfaf4ec, roughness: 0.8, emissive: 0x1a1614, side: THREE.DoubleSide });

    const nc = document.createElement('canvas'); nc.width = nc.height = 64;
    const nx = nc.getContext('2d'); nx.strokeStyle = '#ffffff'; nx.lineWidth = 5;
    nx.beginPath(); nx.moveTo(-4, -4); nx.lineTo(68, 68); nx.moveTo(68, -4); nx.lineTo(-4, 68); nx.stroke();
    const netTex = new THREE.CanvasTexture(nc); netTex.wrapS = netTex.wrapT = THREE.RepeatWrapping; netTex.repeat.set(36, 8);
    const netMat = new THREE.MeshStandardMaterial({ map: netTex, transparent: true, roughness: 1, emissive: 0x2a2420, side: THREE.DoubleSide, depthWrite: false });

    bouq.add(
        cone(0.55, -1.75, 2.25, 0.0, 1.3, 0.14, 7, 120, 18, 0, paperMat),      // main paper bowl
        cone(0.5, -1.7, 2.0, 0.1, 1.3, 0.16, 6, 120, 18, 0.7, paper2Mat),      // lighter inner collar
        cone(0.62, -1.78, 2.5, -0.05, 1.3, 0.1, 9, 144, 18, 0.3, netMat),      // lace mesh draped over the bowl
        cone(0.55, -1.75, 1.05, -2.5, 1, 0.08, 8, 96, 8, 0, paperMat),         // paper skirt under the neck
        cone(0.62, -1.78, 1.25, -2.5, 1, 0.12, 8, 96, 8, 0.5, netMat)          // lace skirt
    );
    const skirtR = y => 0.62 + 0.63 * (-1.78 - y) / 0.72;      // radius of the lace skirt at height y
    const onSkirt = (x, y, off) => Math.sqrt(Math.max(0.01, skirtR(y) ** 2 - x * x)) + off;

    const ribbon = new THREE.MeshStandardMaterial({ color: 0xb8142c, metalness: 0.1, roughness: 0.32, emissive: 0x24030a, side: THREE.DoubleSide });
    const bow = new THREE.Group(); bow.position.set(0, -1.82, onSkirt(0, -1.82, 0.06)); bow.rotation.x = 0.08;
    [-1, 1].forEach(s => {
        const big = new THREE.Mesh(ball, ribbon); big.scale.set(0.4, 0.2, 0.07); big.position.set(s * 0.4, 0.08, 0.03); big.rotation.z = s * 0.2; bow.add(big);
        const low = new THREE.Mesh(ball, ribbon); low.scale.set(0.3, 0.14, 0.06); low.position.set(s * 0.3, -0.12, 0); low.rotation.z = -s * 0.55; bow.add(low);
    });
    const knot = new THREE.Mesh(ball, ribbon); knot.scale.set(0.13, 0.18, 0.1); knot.position.z = 0.06; bow.add(knot); bouq.add(bow);
    function tail(x0, drift, len) {
        const pos = [], idx = [], st = 28;
        for (let i = 0; i <= st; i++) {
            const t = i / st, y = -1.9 - t * len, x = x0 + drift * t + 0.04 * Math.sin(t * 5), z = onSkirt(x, y, 0.06) + 0.02 * Math.sin(t * 7), hw = 0.12 * (1 - 0.15 * t);
            pos.push(x - hw, y, z, x + hw, y, z);
            if (i < st) { const a = i * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
        }
        const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals();
        return new THREE.Mesh(g, ribbon);
    }
    bouq.add(tail(-0.14, -0.1, 0.55), tail(0.12, 0.09, 0.6));

    const TAG = 'For You'; // text on the card
    const tc = document.createElement('canvas'); tc.width = 256; tc.height = 160;
    const ttex = new THREE.CanvasTexture(tc);
    function drawTag() {
        const x = tc.getContext('2d'); x.fillStyle = '#f4e6c8'; x.fillRect(0, 0, 256, 160);
        x.strokeStyle = '#d9ac52'; x.lineWidth = 6; x.strokeRect(8, 8, 240, 144);
        x.fillStyle = '#5a0b17'; x.font = 'italic 600 52px "Cormorant Garamond", Georgia, serif'; x.textAlign = 'center'; x.textBaseline = 'middle';
        x.fillText(TAG, 128, 82); ttex.needsUpdate = true;
    }
    drawTag(); if (document.fonts) document.fonts.ready.then(drawTag);
    const tag = new THREE.Mesh(new THREE.PlaneGeometry(0.45, 0.28), new THREE.MeshBasicMaterial({ map: ttex, side: THREE.DoubleSide }));
    tag.position.set(0.42, -2.12, onSkirt(0.42, -2.12, 0.05)); tag.rotation.set(0.1, 0.5, -0.1); bouq.add(tag);
    bouq.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0.12, -1.86, onSkirt(0.12, -1.86, 0.08)), new THREE.Vector3(0.42, -1.98, onSkirt(0.42, -1.98, 0.06))]), new THREE.LineBasicMaterial({ color: 0xd9ac52 })));

    const FN = reduce ? 24 : 70, fall = new THREE.InstancedMesh(sph, new THREE.MeshStandardMaterial({ color: ROSE, roughness: 0.6, side: THREE.DoubleSide }), FN);
    const fd = [], dm = new THREE.Object3D();
    for (let i = 0; i < FN; i++) {
        fd.push({ x: (Math.random() - 0.5) * 10, y: Math.random() * 7 - 3, z: (Math.random() - 0.5) * 5, s: 0.6 + Math.random() * 0.8, ph: Math.random() * 6, r: Math.random() * 6 });
        fall.setColorAt(i, col.setScalar(0.7 + Math.random() * 0.3));
    }
    scene.add(fall);
    const SN = 140, spos = new Float32Array(SN * 3);
    for (let i = 0; i < SN; i++) { spos[i * 3] = (Math.random() - 0.5) * 9; spos[i * 3 + 1] = Math.random() * 6 - 2.5; spos[i * 3 + 2] = (Math.random() - 0.5) * 4; }
    const sgeo = new THREE.BufferGeometry(); sgeo.setAttribute('position', new THREE.BufferAttribute(spos, 3));
    const smat = new THREE.PointsMaterial({ color: 0xffd98a, size: 0.07, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false });
    scene.add(new THREE.Points(sgeo, smat));

    function burst() {
        pop = 1;
        fd.forEach(f => { f.x = layoutX + rnd(-1.6, 1.6); f.y = rnd(2.4, 3.6); f.z = rnd(-1.2, 1.2); });
        for (let i = 0; i < SN; i++) { spos[i * 3] = layoutX + rnd(-2.6, 2.6); spos[i * 3 + 1] = rnd(-1, 2.5); spos[i * 3 + 2] = rnd(-2, 2); }
    }

    const gc = document.createElement('canvas'); gc.width = gc.height = 40;
    const g = gc.getContext('2d');
    const tex = new THREE.CanvasTexture(gc); tex.magFilter = tex.minFilter = THREE.NearestFilter; tex.generateMipmaps = false;
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true }));
    sprite.scale.set(4.4, 4.4, 1); scene.add(sprite);
    const K = { hair: '#2b1015', skin: '#f6d3b8', blush: '#f08a8a', dress: '#b3122a', dark: '#8f0d20', gold: '#e0b455', shoe: '#3a0a10', eye: '#22090d', leaf: '#2f6b3a', rose: '#e0213f', paper: '#f4e6c8', mouth: '#c0394a' };
    const ACTS = [['Swaying with the bouquet', 5], ['Waving hello', 4.5], ['Smelling a rose', 5.5], ['Tossing petals', 5]];
    const CYCLE = ACTS.reduce((s, a) => s + a[1], 0);
    const cap = document.getElementById('cap');
    let gp = [], lastAct = -1;

    function heart(x, y) {
        g.fillStyle = K.rose;
        [[1, 0, 1], [3, 0, 1], [0, 1, 5], [1, 2, 3], [2, 3, 1]].forEach(([a, b, w]) => g.fillRect(x + a, Math.round(y) + b, w, 1));
    }

    function drawGirl(t, dt) {
        const ph = t % CYCLE; let ai = 0, st = 0;
        while (ph >= st + ACTS[ai][1]) { st += ACTS[ai][1]; ai++; }
        const lt = ph - st;
        if (ai !== lastAct) { lastAct = ai; cap.textContent = ACTS[ai][0]; }
        const sway = ai === 0 ? Math.round(Math.sin(t * 2)) : 0;
        const hop = ai === 3 ? Math.floor(t * 4) % 2 : 0;
        const flap = Math.floor(t * 6) % 2;
        const smelling = ai === 2 && lt < 2.8;
        const closed = smelling || t % 3.4 < 0.18;
        const d = (x, y, w, h, c) => { g.fillStyle = c; g.fillRect(x + 8 + sway, y + 3 - hop, w, h); };
        g.clearRect(0, 0, 40, 40);

        d(7, 3, 10, 1, K.hair); d(6, 4, 12, 10, K.hair); d(6, 14, 2, 4, K.hair); d(16, 14, 2, 4, K.hair);
        d(10, 29, 1, 4, K.skin); d(13, 29, 1, 4, K.skin); d(9, 33, 3, 1, K.shoe); d(12, 33, 3, 1, K.shoe);
        for (let i = 0; i < 9; i++) { const w = 6 + 2 * Math.ceil(i / 2); d(12 - w / 2, 19 + i, w, 1, i % 3 === 2 ? K.dark : K.dress); }
        d(4, 28, 16, 1, K.gold);
        d(9, 14, 6, 5, K.dress); d(10, 14, 4, 1, K.gold); d(9, 18, 6, 1, K.gold);

        d(11, 13, 2, 1, K.skin); d(8, 5, 8, 8, K.skin);
        d(8, 4, 8, 2, K.hair); d(8, 6, 2, 1, K.hair); d(14, 6, 2, 1, K.hair);
        if (closed) { d(9, 9, 2, 1, K.eye); d(13, 9, 2, 1, K.eye); }
        else { d(9, 8, 2, 2, K.eye); d(13, 8, 2, 2, K.eye); d(9, 8, 1, 1, '#fff'); d(13, 8, 1, 1, '#fff'); }
        d(8, 10, 2, 1, K.blush); d(14, 10, 2, 1, K.blush);
        if (ai === 0) d(11, 11, 2, 1, K.mouth);
        else { d(10, 10, 1, 1, K.mouth); d(11, 11, 2, 1, K.mouth); d(13, 10, 1, 1, K.mouth); }
        d(14, 3, 2, 2, K.rose); d(17, 3, 2, 2, K.rose); d(16, 3, 1, 2, K.gold);

        if (ai === 0) {
            d(8, 14, 1, 3, K.skin); d(9, 17, 2, 1, K.skin); d(15, 14, 1, 3, K.skin); d(13, 17, 2, 1, K.skin);
            d(10, 15, 2, 2, K.rose); d(12, 15, 2, 2, '#c4162f'); d(11, 17, 2, 1, '#e8556a');
            d(10, 18, 4, 2, K.paper); d(9, 16, 1, 1, K.leaf); d(14, 16, 1, 1, K.leaf);
        } else if (ai === 1) {
            d(8, 14, 1, 5, K.skin); d(15, 14, 3, 1, K.skin);
            d(16 + flap, 9, 1, 5, K.skin); d(16 + flap, 8, 2, 2, K.skin);
        } else if (ai === 2) {
            d(8, 14, 1, 5, K.skin); d(15, 14, 2, 1, K.skin); d(16, 11, 1, 4, K.skin);
            d(15, 9, 3, 3, K.rose); d(16, 10, 1, 1, K.gold); d(17, 12, 1, 1, K.leaf);
            if (!smelling) { const u = lt - 2.8; heart(31, 12 - u * 4); heart(3, 14 - (u + 0.7) * 4); }
        } else {
            d(6, 14, 3, 1, K.skin); d(15, 14, 3, 1, K.skin); d(6, 10 - flap, 1, 5, K.skin); d(17, 10 - flap, 1, 5, K.skin);
            for (let n = 0; n < 2; n++) {
                const s = n ? 1 : -1;
                gp.push({ x: s < 0 ? 14 : 25, y: 9, vx: s * (3 + Math.random() * 6), vy: -(4 + Math.random() * 6), life: 2, c: Math.random() < 0.25 ? K.gold : PAL[(Math.random() * 5) | 0] });
            }
        }
        gp = gp.filter(p => { p.vy += 14 * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.life -= dt; return p.life > 0 && p.y < 40; });
        gp.forEach(p => { g.fillStyle = p.c; g.fillRect(Math.round(p.x), Math.round(p.y), 2, 1); });
        tex.needsUpdate = true;
    }

    let moved = 0, rotY = 0, rotX = 0.5, drag = false, lx = 0, ly = 0, zoom = 1, curZoom = 1, baseDist = 10, layoutX = 0, layoutY = 0, fit = 1;
    canvas.addEventListener('pointerdown', e => { drag = true; moved = 0; lx = e.clientX; ly = e.clientY; canvas.setPointerCapture(e.pointerId); canvas.style.cursor = 'grabbing'; });
    canvas.addEventListener('pointermove', e => {
        if (!drag) return;
        moved += Math.abs(e.clientX - lx) + Math.abs(e.clientY - ly);
        rotY += (e.clientX - lx) * 0.008; rotX = clamp(rotX + (e.clientY - ly) * 0.005, -0.3, 1.0);
        lx = e.clientX; ly = e.clientY;
    });
    const release = () => { if (drag && moved < 6 && started) burst(); drag = false; canvas.style.cursor = 'grab'; };
    canvas.addEventListener('pointerup', release); canvas.addEventListener('pointercancel', release);
    canvas.addEventListener('wheel', e => { e.preventDefault(); zoom = clamp(zoom * (1 + Math.sign(e.deltaY) * 0.08), 0.55, 1.5); }, { passive: false });

    function resize() {
        const w = innerWidth, h = innerHeight, a = w / h;
        renderer.setSize(w, h, false); camera.aspect = a; camera.updateProjectionMatrix();
        baseDist = a >= 1.45 ? 11.5 : 11.5 * Math.pow(1.45 / a, 0.85);
        const halfW = baseDist * Math.tan(Math.PI / 9) * a;
        // bouquet sits on the left, the girl on the right, so they never overlap
        const wide = a >= 1.2;
        fit = clamp(a / 1.2, 0.62, 1);                       // bouquet shrinks a little on narrow screens
        layoutX = -Math.min(1.6, halfW * (wide ? 0.2 : 0.3));
        layoutY = -2.55 * (1 - fit);                         // keeps the bouquet standing on the floor when it shrinks
        const gs = clamp(a / 1.2, 0.75, 1) * 4.4;            // girl size
        sprite.scale.set(gs, gs, 1);
        sprite.position.set(Math.min(4.3, halfW * (wide ? 0.6 : 0.5)), -2.62 + 0.4 * gs, 1.2);
        floor.scale.x = ring.scale.x = wide ? 1.45 : 1;      // wider velvet stage for both of them
    }
    addEventListener('resize', resize); resize();

    const MUSIC_FILE = 'audio/seasons.mp3'; // put your own copy of the song at this path
    const song = new Audio(MUSIC_FILE); song.loop = true; song.preload = 'auto';
    const hint = document.getElementById('hint'), vol = document.getElementById('vol'), musicBtn = document.getElementById('musicBtn');
    let volume = 0.6;
    try { const sv = localStorage.getItem('rosesVolume'); if (sv !== null) volume = clamp(+sv, 0, 1); } catch (e) {}
    vol.value = Math.round(volume * 100); song.volume = volume;
    let useSong = true, ac, master, timer, step = 0, playing = false;
    const CH = [[220, 261.63, 329.63], [174.61, 220, 261.63], [261.63, 329.63, 392], [196, 246.94, 293.66]];
    const ARP = [0, 1, 2, 1, 2, 1, 2, 1];
    function note(f, t0, len, amp, type) {
        const o = ac.createOscillator(), gn = ac.createGain();
        o.type = type; o.frequency.value = f;
        gn.gain.setValueAtTime(0, t0); gn.gain.linearRampToValueAtTime(amp, t0 + 0.01); gn.gain.exponentialRampToValueAtTime(0.0001, t0 + len);
        o.connect(gn).connect(master); o.start(t0); o.stop(t0 + len + 0.05);
    }
    function tick() {
        const c = CH[Math.floor(step / 8) % 4], i = step % 8, t0 = ac.currentTime;
        if (i === 0) note(c[0] / 2, t0, 2.4, 0.12, 'sine');
        note(c[ARP[i]] * 2, t0, 0.9, 0.06, 'triangle');
        if (i === 4) note(c[2] * 4, t0, 1.2, 0.025, 'sine');
        step++;
    }
    function startSynth() {
        ac = ac || new (window.AudioContext || window.webkitAudioContext)();
        if (!master) { master = ac.createGain(); master.connect(ac.destination); }
        master.gain.value = volume * 2; ac.resume();
        hint.textContent = 'Add your song as audio/seasons.mp3 to play it. The music box is playing for now.';
        clearInterval(timer); tick(); timer = setInterval(tick, 300);
    }
    function setBtn() { musicBtn.setAttribute('aria-pressed', playing); musicBtn.textContent = playing ? 'Music on' : 'Music off'; }
    function play() {
        playing = true; setBtn();
        if (!useSong) return startSynth();
        song.play().catch(() => { useSong = false; if (playing) startSynth(); });
    }
    function stop() { playing = false; setBtn(); song.pause(); clearInterval(timer); }
    song.addEventListener('error', () => { useSong = false; if (playing) startSynth(); });
    musicBtn.addEventListener('click', () => (playing ? stop() : play()));
    vol.addEventListener('input', () => {
        volume = vol.value / 100; song.volume = volume; if (master) master.gain.value = volume * 2;
        try { localStorage.setItem('rosesVolume', volume); } catch (e) {}
    });

    const intro = document.getElementById('intro'), enterBtn = document.getElementById('enterBtn');
    enterBtn.focus();
    enterBtn.addEventListener('click', () => {
        started = true; intro.classList.add('open'); play();
        if (!reduce) setTimeout(burst, 1400); // petals and sparkles rain down as the curtain parts
        setTimeout(() => intro.classList.add('done'), reduce ? 0 : 4300); // the gathered curtains stay as side drapes
    });

    const letter = document.getElementById('letter'), text = document.getElementById('letterText'), closeBtn = document.getElementById('closeBtn');
    let typer;
    function openLetter() {
        letter.hidden = false; text.textContent = ''; closeBtn.focus();
        if (reduce) { text.textContent = LETTER; return; }
        let n = 0; clearInterval(typer);
        typer = setInterval(() => { text.textContent = LETTER.slice(0, ++n); if (n >= LETTER.length) clearInterval(typer); }, 30);
    }
    function closeLetter() { clearInterval(typer); letter.hidden = true; }
    document.getElementById('letterBtn').addEventListener('click', openLetter);
    closeBtn.addEventListener('click', closeLetter);
    letter.addEventListener('click', e => { if (e.target === letter) closeLetter(); });
    addEventListener('keydown', e => { if (e.key === 'Escape' && !letter.hidden) closeLetter(); });

    const clock = new THREE.Clock();
    let T = 0, gAcc = 0, started = false, introT = 0, pop = 0;
    (function frame() {
        requestAnimationFrame(frame);
        const dt = Math.min(clock.getDelta(), 0.05); T += dt;
        if (started) introT = Math.min(1, introT + dt / (reduce ? 0.01 : 4.5));
        const ease = 1 - Math.pow(1 - introT, 3);
        if (!drag && !reduce && started) rotY += dt * 0.25;
        pop = Math.max(0, pop - dt * 1.6); bouq.scale.setScalar(Math.max(0.001, ease) * fit * (1 + 0.06 * Math.sin(pop * Math.PI)));
        bouq.rotation.set(rotX, rotY + (1 - ease) * 4.7, 0); bouq.position.set(layoutX, layoutY + Math.sin(T * 1.2) * 0.04, 0);
        sprite.material.opacity = clamp((introT - 0.55) / 0.45, 0, 1);
        curZoom += (zoom - curZoom) * 0.1;
        camera.position.set(0, 1.3, baseDist * curZoom * (1 + (1 - ease) * 0.8)); camera.lookAt(0, -0.3, 0);

        for (let i = 0; i < FN; i++) {
            const f = fd[i];
            f.y -= f.s * 0.5 * dt; f.x += Math.sin(T * 0.9 + f.ph) * 0.35 * dt; f.r += dt * (1 + f.s);
            if (f.y < -3) { f.y = 4.2; f.x = (Math.random() - 0.5) * 10; }
            dm.position.set(f.x, f.y, f.z); dm.rotation.set(f.r, f.r * 0.7, f.ph); dm.scale.set(0.1, 0.09, 0.02);
            dm.updateMatrix(); fall.setMatrixAt(i, dm.matrix);
        }
        fall.instanceMatrix.needsUpdate = true;

        for (let i = 0; i < SN; i++) { spos[i * 3 + 1] += 0.15 * dt; if (spos[i * 3 + 1] > 3.5) spos[i * 3 + 1] = -2.5; }
        sgeo.attributes.position.needsUpdate = true; smat.opacity = 0.55 + 0.4 * Math.sin(T * 3);

        gAcc += dt;
        if (gAcc > 0.09) { drawGirl(T, gAcc); gAcc = 0; } // about 11 frames a second for the pixel look
        renderer.render(scene, camera);
    })();
})();