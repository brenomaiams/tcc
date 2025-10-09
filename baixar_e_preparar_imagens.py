# baixar_pragas_soja_milho.py
from icrawler.builtin import GoogleImageCrawler
import os
from PIL import Image
import hashlib

# ================= CONFIGURAÇÕES =================
img_size = (224, 224)
num_train = 40
num_validation = 10

# 🟢 Pragas da Soja
pragas_soja = {
    "Lagarta-da-Soja": "Anticarsia gemmatalis",
    "Lagarta-Falsa-Medideira": "Chrysodeixis includens Rachiplusia nu",
    "Percevejo-Marrom": "Euschistus heros",
    "Percevejo-Verde": "Nezara viridula",
    "Percevejo-Pequeno": "Piezodorus guildinii",
    "Mosca-Branca": "Bemisia tabaci",
    "Ácaro-Vermelho": "Tetranychus urticae",
    "Lagarta-do-Cartucho-Soja": "Spodoptera frugiperda soja"
}

# 🌽 Pragas do Milho
pragas_milho = {
    "Lagarta-do-Cartucho-Milho": "Spodoptera frugiperda milho",
    "Lagarta-Rosca": "Agrotis ipsilon",
    "Percevejo-Barriga-Verde": "Dichelops melacanthus",
    "Cigarrinha-do-Milho": "Dalbulus maidis",
    "Broca-da-Cana": "Diatraea saccharalis milho",
    "Pulgão-do-Milho": "Rhopalosiphum maidis milho",
    "Mosca-das-Sementes": "mosca das sementes milho"
}

# Unir todas as pragas
todas_pragas = {**pragas_soja, **pragas_milho}

# ================= FUNÇÕES =================
def img_hash(img):
    return hashlib.md5(img.tobytes()).hexdigest()

def baixar_imagens(nome_praga, termo_busca, num, dir_path):
    os.makedirs(dir_path, exist_ok=True)
    crawler = GoogleImageCrawler(storage={'root_dir': dir_path})
    query = f"{termo_busca} praga {nome_praga} na planta"
    crawler.crawl(keyword=query, max_num=num*2, min_size=(400, 400))
    print(f"✅ Baixadas imagens para: {nome_praga}")

def processar_imagens(dir_path):
    hashes = set()
    for root, _, files in os.walk(dir_path):
        for file in files:
            if not file.lower().endswith(('.jpg', '.jpeg', '.png')):
                continue
            img_path = os.path.join(root, file)
            try:
                img = Image.open(img_path).convert("RGB")
                img = img.resize(img_size)
                h = img_hash(img)
                if h in hashes:
                    os.remove(img_path)
                    continue
                hashes.add(h)
                img.save(img_path)
            except:
                os.remove(img_path)

# ================= LOOP PRINCIPAL =================
for nome, termo in todas_pragas.items():
    # Treino
    path_train = f"dataset/train/{nome}"
    baixar_imagens(nome, termo, num_train, path_train)
    processar_imagens(path_train)

    # Validação
    path_val = f"dataset/validation/{nome}"
    baixar_imagens(nome, termo, num_validation, path_val)
    processar_imagens(path_val)

print("\n🎯 Download e preparação concluídos com sucesso!")
