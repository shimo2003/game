import os
import zipfile
import shutil

def create_zip():
    zip_path = 'public/queen-avatara-tomb-of-karnak.zip'
    download_copy_path = 'public/downloads/queen-avatara-tomb-of-karnak.zip'
    exclude_dirs = {'.git', 'node_modules', 'dist', '.aistudio', '.cache'}
    exclude_files = {'queen-avatara-tomb-of-karnak.zip'}

    os.makedirs('public', exist_ok=True)
    os.makedirs('public/downloads', exist_ok=True)

    with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zf:
        for root, dirs, files in os.walk('.'):
            dirs[:] = [d for d in dirs if d not in exclude_dirs and not d.startswith('.')]
            for file in files:
                if file in exclude_files or file.endswith('.zip'):
                    continue
                full_path = os.path.join(root, file)
                rel_path = os.path.relpath(full_path, '.')
                zf.write(full_path, rel_path)

    shutil.copyfile(zip_path, download_copy_path)
    print(f"Project ZIP created at: {zip_path} ({os.path.getsize(zip_path)} bytes)")
    print(f"Project ZIP copy created at: {download_copy_path}")

if __name__ == '__main__':
    create_zip()
