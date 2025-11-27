# 🔧 Implementación de Password Reset en C# (AREPA-TOOL)

## 📋 PROBLEMA

Actualmente, el botón "Forgot Password" en la aplicación C# solo muestra un mensaje para contactar al administrador. Necesitamos implementar el envío real de emails de recuperación.

---

## ✅ SOLUCIÓN: Dos Opciones

### OPCIÓN 1: Reset desde el Panel Admin (RECOMENDADO)

**Ventajas:**
- ✅ Más simple de implementar
- ✅ No requiere cambios en la app C#
- ✅ El admin tiene control total
- ✅ Ya está implementado en `hide.html`

**Flujo:**
1. Usuario contacta al admin (WhatsApp, Telegram, etc.)
2. Admin entra al panel → Users → Click "Reset Password"
3. Usuario recibe email con link de reset
4. Usuario cambia su contraseña en `reset-password.html`
5. Usuario hace login con nueva contraseña

**Implementación:**
```csharp
// En LoginForm.cs - LnkForgotPassword_LinkClicked
private void LnkForgotPassword_LinkClicked(object sender, LinkLabelLinkClickedEventArgs e)
{
    MessageBox.Show(
        "Para recuperar tu contraseña:\n\n" +
        "1. Contacta al administrador por WhatsApp o Telegram\n" +
        "2. Proporciona tu email registrado\n" +
        "3. Recibirás un link de recuperación por email\n" +
        "4. Sigue las instrucciones del email\n\n" +
        "Contacto Admin:\n" +
        "WhatsApp: +1234567890\n" +
        "Telegram: @admin",
        "Recuperar Contraseña",
        MessageBoxButtons.OK,
        MessageBoxIcon.Information);
}
```

---

### OPCIÓN 2: Reset desde la App C# (AVANZADO)

**Ventajas:**
- ✅ Experiencia de usuario más fluida
- ✅ No requiere contactar al admin
- ✅ Automatizado

**Desventajas:**
- ⚠️ Requiere implementar llamada HTTP a Supabase
- ⚠️ Más complejo de mantener

**Implementación:**

#### Paso 1: Agregar NuGet Package
```bash
# En Package Manager Console
Install-Package RestSharp
```

#### Paso 2: Crear PasswordResetService.cs

```csharp
using System;
using System.Threading.Tasks;
using RestSharp;
using Newtonsoft.Json;

namespace TT_Tool.Services
{
    public class PasswordResetService
    {
        private readonly string _supabaseUrl;
        private readonly string _supabaseKey;

        public PasswordResetService()
        {
            _supabaseUrl = Config.SupabaseConfig.Url;
            _supabaseKey = Config.SupabaseConfig.AnonKey;
        }

        public async Task<(bool success, string message)> SendPasswordResetEmail(string email)
        {
            try
            {
                var client = new RestClient(_supabaseUrl);
                var request = new RestRequest("/auth/v1/recover", Method.Post);
                
                request.AddHeader("apikey", _supabaseKey);
                request.AddHeader("Content-Type", "application/json");
                
                var body = new
                {
                    email = email,
                    options = new
                    {
                        redirectTo = "https://tu-dominio-vercel.vercel.app/reset-password"
                    }
                };
                
                request.AddJsonBody(body);
                
                var response = await client.ExecuteAsync(request);
                
                if (response.IsSuccessful)
                {
                    return (true, "Password reset email sent successfully");
                }
                else
                {
                    return (false, $"Error: {response.ErrorMessage}");
                }
            }
            catch (Exception ex)
            {
                return (false, $"Error: {ex.Message}");
            }
        }
    }
}
```

#### Paso 3: Actualizar LoginForm.cs

```csharp
using System;
using System.Drawing;
using System.IO;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;
using TT_Tool.Controls;
using TT_Tool.Services; // NUEVO

namespace TT_Tool.Forms
{
    public partial class LoginForm : Form
    {
        // ... código existente ...

        private async void LnkForgotPassword_LinkClicked(object sender, LinkLabelLinkClickedEventArgs e)
        {
            // Crear formulario simple para ingresar email
            using (var emailForm = new Form())
            {
                emailForm.Text = "Recuperar Contraseña";
                emailForm.Size = new Size(400, 200);
                emailForm.StartPosition = FormStartPosition.CenterParent;
                emailForm.FormBorderStyle = FormBorderStyle.FixedDialog;
                emailForm.MaximizeBox = false;
                emailForm.MinimizeBox = false;

                var lblEmail = new Label
                {
                    Text = "Ingresa tu email registrado:",
                    Location = new Point(20, 20),
                    Size = new Size(350, 20)
                };

                var txtEmail = new TextBox
                {
                    Location = new Point(20, 50),
                    Size = new Size(350, 25)
                };

                var btnSend = new Button
                {
                    Text = "Enviar",
                    Location = new Point(20, 90),
                    Size = new Size(100, 30),
                    DialogResult = DialogResult.OK
                };

                var btnCancel = new Button
                {
                    Text = "Cancelar",
                    Location = new Point(130, 90),
                    Size = new Size(100, 30),
                    DialogResult = DialogResult.Cancel
                };

                emailForm.Controls.Add(lblEmail);
                emailForm.Controls.Add(txtEmail);
                emailForm.Controls.Add(btnSend);
                emailForm.Controls.Add(btnCancel);
                emailForm.AcceptButton = btnSend;
                emailForm.CancelButton = btnCancel;

                if (emailForm.ShowDialog() == DialogResult.OK)
                {
                    string email = txtEmail.Text.Trim();

                    if (string.IsNullOrWhiteSpace(email))
                    {
                        MessageBox.Show("Por favor ingresa un email.", "Error", 
                            MessageBoxButtons.OK, MessageBoxIcon.Warning);
                        return;
                    }

                    // Validar formato de email
                    if (!System.Text.RegularExpressions.Regex.IsMatch(email, 
                        @"^[^@\s]+@[^@\s]+\.[^@\s]+$"))
                    {
                        MessageBox.Show("Por favor ingresa un email válido.", "Error", 
                            MessageBoxButtons.OK, MessageBoxIcon.Warning);
                        return;
                    }

                    // Enviar email de reset
                    await SendPasswordResetEmail(email);
                }
            }
        }

        private async Task SendPasswordResetEmail(string email)
        {
            // Mostrar loading
            var loadingForm = new Form
            {
                Text = "Enviando...",
                Size = new Size(300, 100),
                StartPosition = FormStartPosition.CenterParent,
                FormBorderStyle = FormBorderStyle.None,
                BackColor = Color.White
            };

            var lblLoading = new Label
            {
                Text = "Enviando email de recuperación...",
                Dock = DockStyle.Fill,
                TextAlign = ContentAlignment.MiddleCenter,
                Font = new Font("Segoe UI", 10F)
            };

            loadingForm.Controls.Add(lblLoading);
            loadingForm.Show(this);
            loadingForm.Refresh();

            try
            {
                var resetService = new PasswordResetService();
                var (success, message) = await resetService.SendPasswordResetEmail(email);

                loadingForm.Close();

                if (success)
                {
                    MessageBox.Show(
                        "Se ha enviado un email de recuperación a tu correo.\n\n" +
                        "Por favor revisa tu bandeja de entrada y spam.\n\n" +
                        "El link expirará en 1 hora.",
                        "Email Enviado",
                        MessageBoxButtons.OK,
                        MessageBoxIcon.Information);
                }
                else
                {
                    MessageBox.Show(
                        $"Error al enviar email: {message}\n\n" +
                        "Por favor contacta al administrador.",
                        "Error",
                        MessageBoxButtons.OK,
                        MessageBoxIcon.Error);
                }
            }
            catch (Exception ex)
            {
                loadingForm.Close();
                MessageBox.Show(
                    $"Error: {ex.Message}\n\n" +
                    "Por favor contacta al administrador.",
                    "Error",
                    MessageBoxButtons.OK,
                    MessageBoxIcon.Error);
            }
        }

        // ... resto del código ...
    }
}
```

---

## 🎯 RECOMENDACIÓN FINAL

**Usa la OPCIÓN 1** (Reset desde Panel Admin) porque:

1. ✅ **Más simple**: No requiere cambios complejos en C#
2. ✅ **Más seguro**: El admin controla quién puede resetear
3. ✅ **Menos mantenimiento**: Todo está en el panel web
4. ✅ **Ya implementado**: Solo necesitas configurar Supabase

**Cuándo usar OPCIÓN 2:**
- Si tienes muchos usuarios (100+)
- Si quieres automatizar completamente el proceso
- Si el admin no está disponible 24/7

---

## 📝 PASOS PARA IMPLEMENTAR (OPCIÓN 1)

### 1. Actualizar LoginForm.cs

```csharp
private void LnkForgotPassword_LinkClicked(object sender, LinkLabelLinkClickedEventArgs e)
{
    var result = MessageBox.Show(
        "Para recuperar tu contraseña:\n\n" +
        "1. Contacta al administrador\n" +
        "2. Proporciona tu email registrado\n" +
        "3. Recibirás un link de recuperación\n\n" +
        "¿Deseas abrir el chat de soporte?",
        "Recuperar Contraseña",
        MessageBoxButtons.YesNo,
        MessageBoxIcon.Information);

    if (result == DialogResult.Yes)
    {
        // Abrir WhatsApp o Telegram del admin
        System.Diagnostics.Process.Start(new System.Diagnostics.ProcessStartInfo
        {
            FileName = "https://wa.me/1234567890", // Tu número de WhatsApp
            UseShellExecute = true
        });
    }
}
```

### 2. Configurar Supabase Dashboard

```
1. Ir a: https://supabase.com/dashboard/project/lumhpjfndlqhexnjmvtu
2. Authentication → URL Configuration
3. Site URL: https://tu-dominio-vercel.vercel.app
4. Redirect URLs: https://tu-dominio-vercel.vercel.app/reset-password
5. Guardar
```

### 3. Actualizar Email Template

```
1. Authentication → Email Templates → Reset Password
2. Cambiar el template:

<h2>Recuperar Contraseña - AREPA-TOOL</h2>
<p>Haz click en el siguiente link para cambiar tu contraseña:</p>
<p><a href="{{ .SiteURL }}/reset-password?token={{ .Token }}&type=recovery">Cambiar Contraseña</a></p>
<p>Este link expira en 1 hora.</p>
<p>Si no solicitaste este cambio, ignora este email.</p>
```

### 4. Probar el Flujo

```
1. Usuario hace click en "Forgot Password"
2. Usuario contacta al admin
3. Admin entra a hide.html → Users
4. Admin hace click en "Reset Password" del usuario
5. Usuario recibe email
6. Usuario hace click en el link
7. Usuario cambia su contraseña en reset-password.html
8. Usuario hace login con nueva contraseña
```

---

## 🔒 SEGURIDAD

- ✅ Los tokens expiran en 1 hora
- ✅ Solo se pueden usar una vez
- ✅ Supabase hashea las contraseñas automáticamente
- ✅ Rate limiting: máximo 4 emails por hora
- ✅ El admin puede ver logs en Supabase Dashboard

---

## 📞 SOPORTE

Si tienes problemas:
1. Verifica que las URLs en Supabase coincidan con tu dominio
2. Revisa los logs en: Supabase Dashboard → Authentication → Logs
3. Verifica que el email del usuario exista en `auth.users`
4. Prueba enviando un email de reset desde el panel admin

