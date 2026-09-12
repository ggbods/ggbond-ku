import paillier

# ===== 角色：疾控中心（持有完整密钥） =====
keys = paillier.key()
n, g, lam, mu = keys[2], keys[4], keys[3], keys[5]

# ===== 角色：三家医院（只拿到公钥 n, g，加密上报） =====
hospitals = [120.5, 235.25, 310.75]      # 各院感染人数（带小数）
scale = 100                               # 放大系数：保留两位小数
encs = [paillier.encrypt(int(v * scale)) for v in hospitals]

# ===== 角色：疾控中心（密文聚合） =====
agg = encs[0]
for c in encs[1:]:
    agg = paillier.add_cipher(agg, c)

# ===== 解密还原 =====
total = paillier.decrypt(agg) / scale

# ===== 明文对照 =====
print("各院明文   :", hospitals)
print("各院密文   :", [str(c)[:40] + "..." for c in encs])
print("聚合密文   :", str(agg)[:40] + "...")
print("解密总和   :", total)
print("明文总和   :", sum(hospitals))
print("结果一致   :", abs(total - sum(hospitals)) < 1e-9)

import time

def bench(bits):
    t0 = time.perf_counter()
    keys = paillier.key(bits)
    t1 = time.perf_counter()
    c = paillier.encrypt(12345, keys)
    t2 = time.perf_counter()
    m = paillier.decrypt(c, keys)
    t3 = time.perf_counter()
    print(f"素数{bits:>4}位 | 密钥生成 {t1-t0:6.2f}s | 加密 {(t2-t1)*1000:7.2f}ms | 解密 {(t3-t2)*1000:7.2f}ms")
for b in (256, 512, 1024):
    bench(b)