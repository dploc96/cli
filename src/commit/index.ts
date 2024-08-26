export default function main() {
  const content = `
  Format: <Type>(<scope>): <message>
  
  Type: *Capitalize the first letter
    - Add:      Add a new feature
    - Update:   Modify code without adding a new feature
    - Fix:      Fix a bug
    - Build:    Changes aimed at the build process
    - Docs:     Documentation changes only
    - Optz:     Improve performance
    - Chore:    Other changes that do not modify src or test files
    - Test:     Add missing test cases or update existing ones

  Scope: The affected area of the commit (Optional)
    - Name of the module, component, service, ...

  Message: A brief description of the commit content

  -------------------------------------------------------------------------------
  Example:
    - Add(home): add home page
    - Update(header): update header component
    - Fix(auth): can't login
`;
  console.log(content);
}
