import os
import subprocess
import sys

def run():
    print("Iniciando restauración de base de datos Demo...")

    # Obtener el path absoluto del directorio raíz
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    db_path = os.path.join(base_dir, 'db.sqlite3')

    # 1. Crear copia de respaldo de db.sqlite3 si existe
    if os.path.exists(db_path):
        backup_path = db_path + '.backup'
        try:
            import shutil
            shutil.copy(db_path, backup_path)
            print(f"Respaldo de seguridad creado en: {backup_path}")
        except Exception as e:
            print(f"Advertencia: No se pudo crear el respaldo: {e}")

        try:
            os.remove(db_path)
            print("Base de datos anterior eliminada.")
        except Exception as e:
            print(f"Error al eliminar la base de datos: {e}")
            sys.exit(1)
    else:
        print("No se encontró base de datos previa, se creará una nueva.")

    # 2. Correr migraciones
    print("Aplicando migraciones...")
    python_exe = sys.executable
    
    migrate_res = subprocess.run([python_exe, 'manage.py', 'migrate', '--noinput'], cwd=base_dir)
    if migrate_res.returncode != 0:
        print("Error al aplicar las migraciones.")
        sys.exit(1)

    # 3. Correr el sembrado
    print("Ejecutando sembrado...")
    seed_res = subprocess.run([python_exe, 'scratch/seed_demo.py'], cwd=base_dir)
    if seed_res.returncode != 0:
        print("Error al sembrar los datos.")
        sys.exit(1)

    print("Restauración de demo completada con éxito!")

if __name__ == '__main__':
    run()
