import { db } from "@/lib/db";

async function main() {
  // await db.education.createMany({
  //   data: [
  //     {
  //       degree: "Diploma In Engineering",
  //       field: "Computer Technology",
  //       school: "Noakhali Ideal Polytechnic Institute",
  //       start: new Date("2020-01-01"),
  //       end: new Date("2025-01-04"),
  //       description:
  //         "Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, voluptatum.",
  //     },
  //     {
  //       degree: "Secondary School Certificate",
  //       field: "Business Studies",
  //       school: "Harinarayanpur Union High School",
  //       start: new Date("2018-01-01"),
  //       end: new Date("2020-01-01"),
  //       description:
  //         "Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, voluptatum.",
  //     },
  //     {
  //       degree: "Junior School Certificate",
  //       field: "N/A",
  //       school: "Harinarayanpur Union High School",
  //       start: new Date("2016-01-01"),
  //       end: new Date("2018-01-01"),
  //       description:
  //         "Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, voluptatum.",
  //     },
  //   ],
  // });
  // await db.experience.createMany({
  //   data: [
  //     {
  //       company: "Divine IT Limited",
  //       role: "Software Engineer Intern",
  //       start: new Date("2024-07-01"),
  //       end: new Date("2024-11-30"),
  //       description:
  //         "Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, voluptatum.",
  //     },
  //   ],
  // });
  // await db.project.createMany({
  //   data: [
  //     {
  //       title: "Pownloader",
  //       category: "Web Development",
  //       description:
  //         "Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, voluptatum.",
  //       github: "https://github.com",
  //       live: "https://www.google.com",
  //       slug: "pownloader",
  //       image:
  //         "https://media.istockphoto.com/id/1335717953/photo/project-manager-working-on-computer-at-the-office-concept-with-icons-of-management-areas-such.jpg?s=1024x1024&w=is&k=20&c=dXQE3MxOVVjDqlKGWh5Pj2EjVt8lrKJse-IjnxhIvVA=",
  //     },
  //     {
  //       title: "S Theme",
  //       category: "VS Code Theme",
  //       description:
  //         "Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, voluptatum.",
  //       github: "https://github.com",
  //       live: "https://www.google.com",
  //       slug: "stheme",
  //       image:
  //         "https://images.vscodethemes.com/PRASSamin.pras-spectrum-theme/pras-twilight-slate-js-preview-AjC2.svg",
  //     },
  //     {
  //       title: "QubitChat",
  //       category: "App Development",
  //       description:
  //         "Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, voluptatum.",
  //       github: "https://github.com",
  //       live: "https://www.google.com",
  //       slug: "qubitchat",
  //       image:
  //         "https://media.istockphoto.com/id/1423173157/vector/devops-and-devsecops-conceptual-illustration.jpg?s=1024x1024&w=is&k=20&c=bLEMp3B1mG9_nRflVaLgnKnvk5w0_7tq8gH_YSclPv4=",
  //     },
  //     {
  //       title: "PrasBridge",
  //       category: "Python Package",
  //       description:
  //         "PrasBridge is a powerful Python package that seamlessly integrates Django and SQLAlchemy, providing enhanced form handling, serialization capabilities, and utility functions for building robust web applications.",
  //       github: "https://github.com/PRASSamin/prasbridge",
  //       live: "https://pypi.org/project/PrasBridge/",
  //       slug: "prasbridge",
  //       tools: [59703, 59656],
  //       image:
  //         "https://github.com/PRASSamin/PrasBridge/raw/main/static/parbridge-full-purple-tp.svg",
  //       content: `
  // [![PrasBridge](./static/parbridge-full-purple-tp.svg)](https://github.com/PRASSamin/PrasBridge)
  // ## About
  // **PrasBridge is a powerful Python package that seamlessly integrates Django and SQLAlchemy, providing enhanced form handling, serialization capabilities, and utility functions for building robust web applications.**
  // [![PyPI version](https://badge.fury.io/py/PrasBridge.svg)](https://badge.fury.io/py/PrasBridge)
  // [![Python Versions](https://img.shields.io/pypi/pyversions/PrasBridge.svg)](https://pypi.org/project/PrasBridge/)
  // [![License](https://img.shields.io/pypi/l/PrasBridge.svg)](https://pypi.org/project/PrasBridge/)
  // ## Features
  // - 🔄 Seamless Django and SQLAlchemy Integration
  // - 📝 Enhanced Form Fields with Extra Functionality
  // - 🔐 Built-in Authentication Forms
  // - 🎨 Customizable Form Rendering
  // - 📦 Flexible Model Serialization
  // - 🛠️ Utility Functions (Token Generation, Slugify)
  // - 💼 Session Management
  // - 🏷️ Custom Template Tags
  // ## Installation
  // \`\`\`bash
  // pip install PrasBridge
  // \`\`\`
  // ## Quick Start
  // ### 1. Configure Database Connection
  // \`\`\`python
  // # settings.py
  // DATABASES = {
  //     'sqlalchemy': {
  //         'URL': 'your-database-url-here'
  //     }
  // }
  // \`\`\`
  // ### 2. Config Installed App
  // \`\`\`python
  // # settings.py
  // INSTALLED_APPS = [
  //     ...
  //     'pras',
  // ]
  // \`\`\`
  // ### 3. Create Models
  // \`\`\`python
  // # models.py
  // from pras.models import PrasBase, BaseUser
  // class User(BaseUser):
  //     __tablename__ = 'users'
  //     # Additional fields can be added here
  //     ...
  // \`\`\`
  // ### 4. Form Handling
  // \`\`\`python
  // from pras.forms import CharField, EmailField, RegistrationForm
  // class CustomRegistrationForm(RegistrationForm):
  //     bio = CharField(max_length=500, required=False)
  //     website = CharField(max_length=200, required=False)
  //     def __init__(self, *args, **kwargs):
  //         super().__init__(model=User, *args, **kwargs)
  // \`\`\`
  // ### 5. Template Tags
  // \`\`\`django
  // {% load pras %}
  // <form method="post">
  //     {% csrf_token %}
  //     {% pInput "username" form=form label=True error=True %}
  //     {% pInput "email" form=form InputClass="custom-input" %}
  //     {% pInput "password" form=form type="password" %}
  //     <button type="submit">Submit</button>
  // </form>
  // \`\`\`
  // ## Detailed Features
  // ---
  // ### Base Models
  // **PrasBridge provides robust base models designed to streamline essential fields for various classes, supporting extensibility and ease of use in applications.**
  // #### \`PrasBase\`
  // \`PrasBase\` is a foundational model for any entity that requires automatic tracking of creation and modification timestamps. It includes the following fields:
  // - \`id:\` Auto-generated primary key for unique identification of each instance.
  // - \`created_at:\` Automatically stores the date and time the instance was created.
  // - \`updated_at:\` Tracks the date and time of the most recent update to the instance.
  // #### \`BaseUser\`
  // \`BaseUser\` builds on PrasBase and provides a structured template for user models. It includes essential fields for managing user accounts and permissions:
  // - \`username:\` Unique identifier for each user.
  // - \`first_name:\` User’s first name.
  // - \`last_name:\` User’s last name.
  // - \`email:\` User’s email address, typically also unique.
  // - \`password:\` Stores the user’s hashed password.
  // - \`is_active:\` Boolean indicating if the account is active.
  // - \`is_staff:\` Boolean flag for administrative permissions.
  // - \`is_superuser:\` Boolean flag for superuser permissions.
  // - \`date_joined:\` Timestamp indicating when the user account was created.
  // - \`PrasBase:\` Inherits \`id\`, \`created_at\`, and \`updated_at\` fields from \`PrasBase\`.
  // These fields make \`BaseUser\` an ideal base for user authentication and authorization in applications, with built-in fields for permissions and user management.
  // ##### Example
  // \`\`\`python
  // from pras import PrasBase, BaseUser
  // # Custom user model inheriting from BaseUser for applications that require user profiles
  // class User(BaseUser):
  //     __tablename__ = 'users'
  //     # Additional fields and methods specific to User can be added here
  //     ...
  // # Example model for a library system
  // class Book(PrasBase):
  //     __tablename__ = 'books'
  //     title = Column(String, nullable=False)
  //     author = Column(String, nullable=False)
  //     isbn = Column(String, unique=True, nullable=False)
  //     ...
  //     # Additional attributes and methods specific to Book can be defined here
  // \`\`\`
  // ##### Notes
  // - \`Flexibility:\` Both \`PrasBase\` and \`BaseUser\` provide a flexible base structure that you can extend to suit specific application needs.
  // - \`Consistency:\` Utilizing these models ensures that essential fields like \`created_at\` and \`updated_at\` are consistently applied across your application.
  // - \`Customizability:\` By inheriting from these bases, additional fields can be seamlessly added to create tailored entities.
  // ---
  // ### Enhanced Form Fields
  // **PrasBridge provides a suite of enhanced form fields with customizable options for common field types, including:**
  // - \`CharField\`
  // - \`EmailField\`
  // - \`TextAreaField\`
  // - \`ChoiceField\`
  // - \`CheckboxField\`
  // - \`DateField\`
  // - \`IntegerField\`
  // ---
  // #### Common Arguments
  // **These arguments apply to all PrasBridge form fields, providing flexible customization for events, accessibility, and styling:**
  // - **Events:** \`onclick\`, \`onfocus\`, \`onblur\`, \`onchange\` – JavaScript functions for handling user interactions.
  // - **Attributes:** \`required\`, \`disabled\`, \`readonly\`, \`autocomplete\` – Common HTML attributes for form fields.
  // - **Styling and Classes:** \`classes\`, \`style\`, \`id\` – Options to add CSS classes, inline styles, and set a unique ID.
  // - **Display Options:** \`label\`, \`label_suffix\`, \`help_text\` – Control label visibility, label suffix, and help text for field hints.
  // - **Field-Specific Options:** \`initial\`, \`value\`, \`show_hidden_initial\`, \`localize\`, \`validators\`, \`data_attrs\`, \`aria_attrs\` – Set initial values, localize content, and add custom validation and data attributes.
  // ---
  // #### Field Types
  // Each field type in PrasBridge includes arguments that are commonly defined using Django's attrs dictionary for widgets. PrasBridge fields offer these as direct arguments for ease of use.
  // ---
  // ##### CharField and EmailField
  // **\`CharField\` and \`EmailField\` allow direct assignment of common attributes without defining them within \`attrs={}\`.**
  // - **Arguments**
  //   - \`type (CharField only):\` Field type, such as "text", "email", or "password".
  //   - \`placeholder:\` Placeholder text within the field.
  //   - \`max_length / min_length:\` Constraints on the length of input.
  //   - \`title:\` Tooltip text.
  //   - \`size:\` Size of the input field.
  //   - \`strip:\` Strips whitespace if True.
  //   - \`empty_value:\` Value if the field is empty.
  // - **Note**
  //   - \`type\` argument is only for CharField
  //   - \`CharField\` can be set to \`email\` type, \`EmailField\` offers enhanced validation and error handling for email input.
  // - **Example**
  //   \`\`\`python
  //   from pras.forms.fields import CharField, EmailField
  //   class MyForm(forms.Form):
  //       name = CharField(
  //           type="text",  # text, email, or password
  //           placeholder="Enter your name",
  //           required=True,
  //           ...
  //       )
  //       email = EmailField(
  //           placeholder="Enter your email",
  //           ...
  //       )
  //   \`\`\`
  // ---
  // ##### TextAreaField
  // **PRAS’s \`TextAreaField\` streamlines attribute customization, bypassing the need for \`attrs={}\`.**
  // - **Arguments**
  //   - \`rows / cols:\` Set the dimensions of the text area.
  //   - \`placeholder:\` Placeholder text for the field.
  //   - \`max_length / min_length:\` Limits on text length.
  //   - \`size:\` Size of the field.
  //   - \`strip:\` Strips whitespace if True.
  //   - \`empty_value:\` Value if the field is empty.
  // - **Example**
  //   \`\`\`python
  //   from pras.forms.fields import TextAreaField
  //   class MyForm(forms.Form):
  //       bio = TextAreaField(
  //           rows=4,
  //           cols=50
  //           ...
  //       )
  //   \`\`\`
  // ---
  // ##### ChoiceField
  // **\`ChoiceField\` supports predefined options without needing a widget definition.**
  // - **Arguments**
  //   - \`choices:\` List of tuple pairs representing value-label options.
  // - **Example**
  //   \`\`\`python
  //   from pras.forms.fields import ChoiceField
  //   class MyForm(forms.Form):
  //       gender = ChoiceField(
  //           choices=[('Male', 'Male'), ('Female', 'Female')],
  //           ...
  //           )
  //   \`\`\`
  // ---
  // ##### CheckboxField
  // **PRAS’s \`CheckboxField\` allows easy configuration of checked status.**
  // - **Arguments**
  //   - \`checked:\` Boolean, if True, checkbox appears selected.
  // - **Example**
  //   \`\`\`python
  //   from pras.forms.fields import CheckboxField
  //   class MyForm(forms.Form):
  //       agree = CheckboxField(
  //           checked=True,
  //           ...
  //       )
  //   \`\`\`
  // ---
  // ##### DateField
  // **\`DateField\` supports date input with optional format validation.**
  // - **Arguments**
  //   - \`input_formats:\` List of accepted date formats for validation.
  // - **Example**
  //   \`\`\`python
  //   from pras.forms.fields import DateField
  //   class MyForm(forms.Form):
  //       birthdate = DateField(
  //           input_formats=["%Y-%m-%d"],
  //           ...
  //       )
  //   \`\`\`
  // ##### IntegerField
  // **\`IntegerField\` provides constraints and step control for numeric inputs.**
  // - **Arguments**
  //   - \`min_value / max_value:\` Limits for accepted values.
  //   - \`step:\` Increment step size
  // - **Example**
  //   \`\`\`python
  //   from pras.forms.fields import IntegerField
  //   class MyForm(forms.Form):
  //       age = IntegerField(
  //           min_value=18,
  //           max_value=100,
  //           step=1,
  //           ...
  //       )
  //   \`\`\`
  // ### Built-in Forms
  // **PrasBridge Provides built-in forms for common authentication and registration.**
  // - **AuthenticationForm**
  // - **RegistrationForm**
  // These forms handle the save functionality after cleaning and validating user input. However, both forms require a valid user model to function correctly—without one, they will raise an error. To use these forms, pass a valid model upon creation. If you need to modify the save functionality, you can override the save method.
  // ---
  // #### Example
  // \`\`\`python
  // # forms.py
  // from pras.forms import AuthenticationForm, RegistrationForm
  // from pras.forms.fields import CharField
  // from .models import User
  // # Extending the AuthenticationForm
  // class MyAuthenticationForm(AuthenticationForm):
  //     confirm_password = CharField(
  //         type="password",
  //         placeholder="Confirm password",
  //         required=True
  //     )
  //     def __init__(self, *args, **kwargs):
  //         # Pass a valid user model for \`save\` functionality
  //         super().__init__(model=User, *args, **kwargs)
  // # views.py
  // from .forms import MyAuthenticationForm
  // from .models import User
  // from pras.forms import AuthenticationForm
  // def login(request):
  //     # Custom form instance with a specified model
  //     form = MyAuthenticationForm(
  //         model=User,  # Optional if the model is set in the form class
  //         data=request.POST or None
  //     )
  //     # Alternatively, use the main AuthenticationForm without extending it
  //     form = AuthenticationForm(model=User, data=request.POST or None)
  //     if form.is_valid():
  //         form.save()  # Completes the login process with a valid User model
  //     return render(request, 'login.html', {'form': form})
  // # Same for RegistrationForm also you need to pass a valid user model for \`save\` functionality like above
  // \`\`\`
  // #### Note
  // - **The same usage applies for \`RegistrationForm\` as it does for \`AuthenticationForm\`:** Both forms require a valid user model to utilize the save functionality, whether you’re using them directly or extending them.
  // - **Best Practice for Extending Forms:** When extending \`AuthenticationForm\`, \`RegistrationForm\`, or any other form within PRAS, it’s recommended to use the form fields provided by PrasBridge (\`CharField\`, \`EmailField\`, etc.) rather than Django’s built-in fields. These PrasBridge fields offer enhanced functionality with common arguments that streamline the configuration of attributes, keeping the implementation consistent with the PrasBridge other features. Additionally, PrasBridge’s fields are essential for compatibility with other PrasBridge-specific features, such as custom tags, ensuring seamless integration and 100% compatibility across all functionalities.
  // ---
  // ### Serialization
  // **PrasBridge provides flexible serialization options for your models:**
  // #### Key Concepts
  // - **Serialization Prefix**: Use a specific prefix when defining serialization schemas. For example, use \`PRAS_\` as the prefix for your schemas, such as \`PRAS_BasicInfo\`.
  // - **Identifier Field**: The identifier field is crucial for defining serialization schemas. This unique field allows you to access the serialized data from the model using the \`to_dict\` method. You must pass the identifier to \`to_dict\` to serialize the data according to the specified schema.
  // - **Fields**: The \`fields\` attribute is used to define which fields to serialize. It accepts three types of patterns:
  //   - \`__all__\`: Includes all fields. (default).
  //   - \`username\`: Serializes and returns only the \`username\` field data.
  //   - \`!field_name\`: Excludes the specified field from serialization. For example, use \`!password\` to exclude the password field.
  // ##### Example
  // \`\`\`python
  // from pras.models import BaseUser
  // class User(BaseUser):
  //     __tablename__ = 'users'
  //     # Define fields for the model
  //     # Define serialization schemas
  //     class PRAS_AllInfo:
  //         __identifier__ = 'allinfo'
  //         fields = ['__all__']  # Returns all data of the model
  //     class PRAS_UsernameInfo:
  //         __identifier__ = 'specific'
  //         fields = ['username']  # Returns only the username field data
  //     class PRAS_ExcludeInfo:
  //         __identifier__ = 'exclude'
  //         fields = ['!password']  # Returns all data except the password field
  // # Usage
  // user = User.query.first()
  // all_info = user.to_dict('allinfo')          # All user data
  // username_info = user.to_dict('specific')     # Only username data
  // exclude_info = user.to_dict('exclude')       # All data except password
  // \`\`\`
  // - **Serializing Related Models**: To serialize related models, define a serialization pattern for related fields. For instance, if a model has a field \`user = relationship(User)\`, you need to specify the fields you wish to include.
  //   - **Supported Patterns**:
  //     - \`__all__\`: Include all fields of the related model.
  //     - \`!field_name\`: Exclude specified fields.
  //     - \`field_name\`: Include only that specific field.
  // ##### Example
  // \`\`\`python
  // from pras.models import PrasBase, BaseUser
  // class User(BaseUser):
  //     __tablename__ = 'users'
  //     # Define fields for the user model
  //     ...
  // class Book(PrasBase):
  //     __tablename__ = 'books'
  //     user_id = Column(Integer, ForeignKey('users.id'))
  //     user = relationship(User)
  //     ...
  //     # Define serialization schema
  //     class PRAS_BookInfo:
  //         __identifier__ = 'bookinfo'
  //         user = ['username', 'email']  # Returns only username and email of the related user named field
  //         fields = ['__all__']  # Returns all data of the Book model
  // # Usage
  // book = Book.query.first()
  // book_info = book.to_dict('bookinfo')  # Serializes book data along with specified user fields
  // \`\`\`
  // ##### Serializing Without \`PrasBase\` or \`BaseUser\`
  // While \`PrasBase\` and \`BaseUser\` are designed for seamless integration with PrasBridge serialization features with SQLAlchemy, you can enable serialization for models that don’t use them by implementing the following:
  // \`\`\`python
  // from pras.serializers import PrasSerializer, IntegratedMeta  # Import PrasSerializer and IntegratedMeta
  // from sqlalchemy.ext.declarative import declarative_base  # Import SQLAlchemy's declarative base
  // Base = declarative_base(metaclass=IntegratedMeta)  # Pass IntegratedMeta to sync PrasBridge serialization
  // class MyModel(Base, PrasSerializer):  # Inherit Base and PrasSerializer
  //     __tablename__ = 'users'
  //     ...
  //     class PRAS_BookInfo:
  //         __identifier__ = 'bookinfo'
  //         fields = ['__all__']
  // \`\`\`
  // ##### Note
  // - The preferred approach is to use \`PrasBase\` and \`BaseUser\` to ensure smooth integration with PRAS’s functionality. However, if you choose to use other base classes, you must manually enable the serialization feature with the above method.
  // ---
  // ### Session Management
  // **PRASAlchemy provides efficient session management with automatic transaction handling for SQLAlchemy sessions:**
  // #### Key Concepts
  // - **\`session_scope\`**: A context manager that facilitates automatic transaction handling for SQLAlchemy sessions. It commits the session if no exceptions occur and rolls back the transaction if an exception is raised.
  // - **\`get_session\`**: Returns a new session object for database operations.
  // - **\`close\`**: Closes the specified session.
  // #### Usage
  // ##### Using the Context Manager
  // \`\`\`python
  // from pras.session import SQLAlchemySessionManager
  // session_manager = SQLAlchemySessionManager()
  // with session_manager.session_scope() as session:
  //     user = session.query(User).first()
  //     user.email = "new@email.com"
  //     # Automatically commits if no exception occurs; rolls back if an exception occurs.
  // \`\`\`
  // ###### \`Manual Session Management\`
  // \`\`\`python
  // from pras.session import SQLAlchemySessionManager
  // session_manager = SQLAlchemySessionManager()
  // session = session_manager.get_session()
  // try:
  //     user = session.query(User).first()
  //     user.email = "new@email.com"
  //     session.commit()  # Explicitly commit the session
  // except Exception as e:
  //     session.rollback()  # Rollback on exception
  //     raise e
  // finally:
  //     session_manager.close(session)  # Ensure the session is closed
  // \`\`\`
  // ---
  // ### Tokenization
  // **PrasBridge provides robust tokenization features for generating secure tokens and user-friendly slugs.**
  // #### Token Generation
  // ##### \`make_token\`
  // | **Argument** | **Type** | **Required** | **Default** | **Description**                         |
  // | ------------ | -------- | ------------ | ----------- | --------------------------------------- |
  // | \`length\`     | \`int\`    | \`False\`      | \`32\`        | The length of the generated token.      |
  // | \`numb\`       | \`bool\`   | \`False\`      | \`True\`      | Include numbers in the token.           |
  // | \`lower\`      | \`bool\`   | \`False\`      | \`True\`      | Include lowercase letters in the token. |
  // | \`upper\`      | \`bool\`   | \`False\`      | \`True\`      | Include uppercase letters in the token. |
  // ##### Example
  // \`\`\`python
  // from pras.hashers import make_token
  // # Generate a secure token with specified options
  // token = make_token(length=10, numb=False, lower=True, upper=True)
  // print(token)  # Example output: 'aBcDeFgHiJ'
  // \`\`\`
  // #### Slug Generation
  // ##### \`slugify\`
  // | **Argument** | **type** | **Required** | **Default**    | **Description**                                                              |
  // | ------------ | -------- | ------------ | -------------- | ---------------------------------------------------------------------------- |
  // | \`title\`      | \`str\`    | \`True\`       | \`None\`         | The title to be slugified.                                                   |
  // | \`rand\`       | \`bool\`   | \`False\`      | \`False\`        | Add random string to the slug.                                               |
  // | \`rand_len\`   | \`int\`    | \`False\`      | \`10\`           | Length of random string.                                                     |
  // | \`dt\`         | \`bool\`   | \`False\`      | \`False\`        | Include current datetime in the slug.                                        |
  // | \`ms\`         | \`bool\`   | \`False\`      | \`False\`        | Include milliseconds in the slug.                                            |
  // | \`structure\`  | \`str\`    | \`False\`      | \`'title-rand'\` | Structure of the slug (order of elements).                                   |
  // | \`sep\`        | \`str\`    | \`False\`      | \`'-'\`          | Separator used in the slug.                                                  |
  // | \`case\`       | \`bool\`   | \`False\`      | \`False\`        | Preserve the original case of the \`title\`; if \`False\`, convert to lowercase. |
  // | \`spchar\`     | \`bool\`   | \`False\`      | \`False\`        | Include special characters in the slug.                                      |
  // ##### Example
  // \`\`\`python
  // from pras.hashers import slugify
  // # Basic slug generation
  // slug = slugify("My Blog Post")  # Result: 'my-blog-post'
  // # Advanced slug generation with multiple options
  // slug = slugify(
  //     "My Blog Post",
  //     rand=True,              # Add random string
  //     rand_len=10,           # Length of random string
  //     dt=True,               # Add current datetime
  //     ms=True,               # Include milliseconds
  //     structure='title-dt-rand-ms',  # Define slug structure
  //     sep='-',               # Use '-' as separator
  //     case=True,             # Preserve original case
  //     spchar=False           # Exclude special characters
  // )
  // print(slug)  # Example output: 'My-Blog-Post-20241028-142837-KtFf1-RFAAa-1730104117955'
  // \`\`\`
  // ---
  // ### Template Tags
  // **PrasBridge provides a set of template tags to easily render forms and input fields with customizable options.**
  // #### \`pInput\`
  // Renders a specific input field with customizable options.
  // | **Attribute**  | **Type** | **Expected**    | **Required** | **Default** | **Description**                                    |
  // | -------------- | -------- | --------------- | ------------ | ----------- | -------------------------------------------------- |
  // | \`field_name\`   | \`str\`    | \`any\`           | \`True\`       | \`None\`      | The name of the form field.                        |
  // | \`form\`         | \`Form\`   | \`any\`           | \`False\`      | \`form\`      | The form instance where the input field is stored. |
  // | \`html\`         | \`str\`    | \`any\`           | \`False\`      | \`None\`      | Custom HTML code to render in the label tag.       |
  // | \`Class\`        | \`str\`    | \`any\`           | \`False\`      | \`None\`      | CSS class for the main container.                  |
  // | \`style\`        | \`str\`    | \`any\`           | \`False\`      | \`None\`      | CSS styles for the input field.                    |
  // | \`LabelClass\`   | \`str\`    | \`any\`           | \`False\`      | \`None\`      | CSS class for the label tag.                       |
  // | \`InputClass\`   | \`str\`    | \`any\`           | \`False\`      | \`None\`      | CSS class for the input field.                     |
  // | \`ErrorClass\`   | \`str\`    | \`any\`           | \`False\`      | \`None\`      | CSS class for the error message.                   |
  // | \`label\`        | \`bool\`   | \`true or false\` | \`False\`      | \`true\`      | Whether to render the label.                       |
  // | \`error\`        | \`bool\`   | \`true or false\` | \`False\`      | \`true\`      | Whether to render the error message.               |
  // | \`defaultEv\`    | \`bool\`   | \`true or false\` | \`False\`      | \`true\`      | Disable default behaviors if set to \`False\`.       |
  // | \`placeholder\`  | \`str\`    | \`any\`           | \`False\`      | \`None\`      | Placeholder text for the input field.              |
  // | \`LabelText\`    | \`str\`    | \`any\`           | \`False\`      | \`None\`      | Text to be displayed in the label.                 |
  // | \`defaultValue\` | \`str\`    | \`any\`           | \`False\`      | \`None\`      | Default value for the input field.                 |
  // ##### Example
  // \`\`\`django
  // <!-- Load the PrasBridge template tags -->
  // {% load pras %}
  // <!-- Render an input field for email -->
  // {% pInput "email" -> field_name
  //     form="form"
  //     Class="wrapper-class"
  //     InputClass="input-class"
  //     LabelClass="label-class"
  //     ErrorClass="error-class"
  //     label="true"
  //     error="true"
  //     placeholder="Enter email"
  //     LabelText="Custom Label"
  // %}
  // \`\`\`
  // ##### \`pForm\`
  // Renders the complete form with customizable options.
  // | **Attribute** | **Type** | **Expected** | **Required** | **Default** | **Description** |
  // | --- | --- | --- | --- | --- | --- |
  // | \`form\` | \`Form\` | \`any\` | \`False\` | \`form\` | The form instance to be rendered. |
  // | \`method\` | \`str\` | \`any\` | \`False\` | \`'post'\` | HTTP method for the form submission. |
  // | \`action\` | \`str\` | \`any\` | \`False\` | \`None\` | Action URL for form submission. |
  // | \`Class\` | \`str\` | \`any\` | \`False\` | \`None\` | CSS class for the main container. |
  // | \`FormClass\` | \`str\` | \`any\` | \`False\` | \`None\` | CSS class for the form element. |
  // | \`InputClass\` | \`str\` | \`any\` | \`False\` | \`None\` | CSS class for the input fields. |
  // | \`id\` | \`str\` | \`any\` | \`False\` | \`None\` | ID for the form element. |
  // | \`ButtonLabel\` | \`str\` | \`any\` | \`False\` | \`'Submit'\` | Label text for the submit button. |
  // | \`ButtonClass\` | \`str\` | \`any\` | \`False\` | \`None\` | CSS class for the submit button. |
  // | \`LabelClass\` | \`str\` | \`any\` | \`False\` | \`None\` | CSS class for label tags. |
  // | \`ErrorClass\` | \`str\` | \`any\` | \`False\` | \`None\` | CSS class for error messages. |
  // | \`label\` | \`bool\` | \`true or false\` | \`False\` | \`true\` | Whether to render labels for input fields. |
  // | \`error\` | \`bool\` | \`true or false\` | \`False\` | \`true\` | Whether to render error messages. |
  // | \`defaultEv\` | \`bool\` | \`true or false\` | \`False\` | \`true\` | Disable default behaviors if set to \`False\` |
  // ##### Example
  // \`\`\`django
  // <!-- Load the PrasBridge template tags -->
  // {% load pras %}
  // <!-- Render a complete form -->
  // {% pForm "form"
  //     method="post"
  //     action="/submit"
  //     Class="form-wrapper"
  //     FormClass="form-class"
  //     InputClass="input-class"
  //     ButtonLabel="Submit"
  //     ButtonClass="btn-class"
  // %}
  // \`\`\`
  // ##### Note
  // - To leverage the full functionality of these tags, it is recommended to use PrasBridge-provided form fields, as they synchronize more efficiently with PrasBridge template tags. While Django form fields are supported, using PrasBridge fields allows for greater customization and compatibility.
  // ---
  // ## Best Practices
  // 1. Always use PrasBridge form fields instead of Django form fields for consistent styling and functionality.
  // 2. Use the session manager's context manager (\`session_scope\`) when possible for automatic transaction handling.
  // 3. Define clear serialization schemas for different use cases.
  // 4. Utilize the built-in user authentication forms for standard user management.
  // ## Contributing
  // Contributions are welcome! Please feel free to submit a Pull Request.
  // ## License
  // This project is licensed under the MIT License - see the LICENSE file for details.
  // ## Support
  // If you encounter any problems or have questions, please:
  // 1. Check the documentation
  // 2. Open an issue on GitHub
  // 3. Contact the maintainers
  // ## Credits
  // **PRAS** is maintained by [**PRASSamin**](https://github.com/PRASSamin) and was created to simplify Django and SQLAlchemy integration while providing enhanced functionality for modern web applications.
  // `,
  //     },
  //   ],
  // });
  // Function to generate a single blog object
  // function generateBlog() {
  //   const title = faker.lorem.words({ min: 2, max: 7 });
  //   const slug = title
  //     .toLowerCase()
  //     .replace(/[^a-z0-9]+/g, "-")
  //     .replace(/(^-|-$)/g, "");
  //   const description = faker.lorem.paragraph({ min: 2, max: 4 });
  //   const thumbnail = faker.image.urlPicsumPhotos({blur:0, grayscale: false, width: 1024, height: 720});
  //   const content = `# ${title}\n\n${faker.lorem.paragraphs({
  //     min: 3,
  //     max: 6,
  //   })}`;
  //   const tags = Array.from(
  //     { length: faker.number.int({ min: 1, max: 5 }) },
  //     () => faker.lorem.word().toLowerCase()
  //   );
  //   return {
  //     title,
  //     slug,
  //     description,
  //     thumbnail,
  //     content,
  //     tags,
  //   };
  // }
  // function generateBlog() {
  //   const title = faker.lorem.words({ min: 2, max: 5 });
  //   const slug = title
  //     .toLowerCase()
  //     .replace(/[^a-z0-9]+/g, "-")
  //     .replace(/(^-|-$)/g, "");
  //   const description = faker.lorem.paragraph({ min: 2, max: 4 });
  //   const image = faker.image.personPortrait();
  //   const content = `# ${title}\n\n${faker.lorem.paragraphs({
  //     min: 3,
  //     max: 6,
  //   })}`;
  //   const category = faker.lorem.word();
  //   const githubUrl = faker.internet.url();
  //   const liveUrl = faker.internet.url();
  //   return {
  //     title,
  //     slug,
  //     description,
  //     image,
  //     content,
  //     category,
  //     github: githubUrl,
  //     live: liveUrl,
  //   };
  // }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
