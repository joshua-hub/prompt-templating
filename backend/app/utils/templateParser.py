import re
from typing import List
from app.db.models import InputField

def parse_template(template_content: str) -> List[InputField]:
    """
    Parse a template string and extract input fields
    
    Args:
        template_content: The template content string
        
    Returns:
        List of InputField objects
    """
    # Regular expression to match input fields in the template
    input_field_pattern = r"#############\s*title:\s*([^\n]+)\s*description:\s*([^#]+)\s*#############"
    matches = re.finditer(input_field_pattern, template_content, re.DOTALL)
    
    input_fields = []
    for i, match in enumerate(matches):
        field_id = f"field-{i+1}"
        title = match.group(1).strip()
        description = match.group(2).strip()
        
        input_field = InputField(
            id=field_id,
            title=title,
            description=description
        )
        
        input_fields.append(input_field)
    
    return input_fields

def fill_template(template_content: str, input_values: dict) -> str:
    """
    Fill a template with user input values
    
    Args:
        template_content: The template content
        input_values: Dict with field IDs as keys and user inputs as values
        
    Returns:
        The filled template with user inputs
    """
    # Get input fields and their positions
    input_fields = parse_template(template_content)
    filled_template = template_content
    
    # Replace each input field block with the user's value
    for field in input_fields:
        if field.id in input_values:
            user_value = input_values[field.id]
            
            # Create pattern to match this specific field
            field_pattern = re.compile(
                r"#############\s*title:\s*" + re.escape(field.title) + 
                r"\s*description:\s*" + re.escape(field.description) + 
                r"\s*#############",
                re.DOTALL
            )
            
            # Replace the field with user input
            filled_template = field_pattern.sub(user_value, filled_template)
    
    return filled_template 