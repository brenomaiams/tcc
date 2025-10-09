# ml_model/pragas.py
import os
import sys
import json
import numpy as np
import tensorflow as tf
from tensorflow.keras.preprocessing.image import ImageDataGenerator, load_img, img_to_array
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.layers import Dense, GlobalAveragePooling2D, Dropout
from tensorflow.keras.models import Model, load_model

# Silencia logs e warnings do TensorFlow
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'

MODEL_PATH = "ml_model/pragas_model.h5"
CLASSES_PATH = "ml_model/classes.json"
IMG_SIZE = (224, 224)
BATCH_SIZE = 32
EPOCHS = 10


def carregar_classes(train_dir="dataset/train"):
    """Lê automaticamente as classes com base nas pastas do dataset"""
    if not os.path.exists(train_dir):
        raise Exception(f"Diretório de treino não encontrado: {train_dir}")
    classes = sorted([d for d in os.listdir(train_dir) if os.path.isdir(os.path.join(train_dir, d))])
    print(f"🟢 Classes detectadas: {classes}")
    return classes


def treinar_modelo():
    train_dir = "dataset/train"
    val_dir = "dataset/validation"

    CLASS_NAMES = carregar_classes(train_dir)

    train_datagen = ImageDataGenerator(
        preprocessing_function=tf.keras.applications.mobilenet_v2.preprocess_input,
        rotation_range=20,
        width_shift_range=0.1,
        height_shift_range=0.1,
        horizontal_flip=True,
    )

    val_datagen = ImageDataGenerator(
        preprocessing_function=tf.keras.applications.mobilenet_v2.preprocess_input
    )

    train_gen = train_datagen.flow_from_directory(
        train_dir, target_size=IMG_SIZE, batch_size=BATCH_SIZE, class_mode="categorical"
    )
    val_gen = val_datagen.flow_from_directory(
        val_dir, target_size=IMG_SIZE, batch_size=BATCH_SIZE, class_mode="categorical"
    )

    # Cria o modelo base (pré-treinado)
    base_model = MobileNetV2(weights="imagenet", include_top=False, input_shape=(224, 224, 3))
    x = base_model.output
    x = GlobalAveragePooling2D()(x)
    x = Dense(256, activation="relu")(x)
    x = Dropout(0.3)(x)
    preds = Dense(len(CLASS_NAMES), activation="softmax")(x)

    model = Model(inputs=base_model.input, outputs=preds)

    # Congela as camadas base
    for layer in base_model.layers:
        layer.trainable = False

    model.compile(optimizer="adam", loss="categorical_crossentropy", metrics=["accuracy"])

    print("\n🚀 Iniciando treinamento...\n")
    model.fit(train_gen, validation_data=val_gen, epochs=EPOCHS)

    os.makedirs("ml_model", exist_ok=True)
    model.save(MODEL_PATH)

    with open(CLASSES_PATH, "w", encoding="utf-8") as f:
        json.dump(CLASS_NAMES, f, ensure_ascii=False, indent=2)

    print(f"\n✅ Modelo salvo em {MODEL_PATH}")
    print(f"✅ Classes salvas em {CLASSES_PATH}")

    return model


def carregar_modelo():
    if not os.path.exists(MODEL_PATH):
        print("⚠️ Modelo não encontrado. Iniciando treinamento...")
        return treinar_modelo()
    model = load_model(MODEL_PATH)
    return model


def carregar_classes_salvas():
    if os.path.exists(CLASSES_PATH):
        with open(CLASSES_PATH, "r", encoding="utf-8") as f:
            return json.load(f)
    else:
        return carregar_classes()


def prever_imagem(img_path):
    if not os.path.exists(img_path):
        return {"erro": f"Arquivo não encontrado: {img_path}"}
    try:
        model = carregar_modelo()
        CLASS_NAMES = carregar_classes_salvas()

        img = load_img(img_path, target_size=IMG_SIZE)
        x = img_to_array(img)
        x = np.expand_dims(x, axis=0)
        x = tf.keras.applications.mobilenet_v2.preprocess_input(x)

        preds = model.predict(x, verbose=0)
        class_id = int(np.argmax(preds, axis=1)[0])
        confidence = float(np.max(preds))

        return {"classe": CLASS_NAMES[class_id], "confianca": confidence}

    except Exception as e:
        return {"erro": str(e)}


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"erro": "Forneça o caminho da imagem"}))
        sys.exit(1)

    img_path = sys.argv[1]
    resultado = prever_imagem(img_path)
    print(json.dumps(resultado, ensure_ascii=False))
