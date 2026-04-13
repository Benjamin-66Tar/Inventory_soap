from django.apps import AppConfig

class InventoryConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'inventory'

    def ready(self):

        import inventory.signals  # Esto activa las señales al iniciar el servidor
        # Al importar aquí, Django registra los @receiver definidos en signals.py
