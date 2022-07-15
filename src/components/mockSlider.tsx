// Mock material-ui slider.... they're difficult to query in tests
// https://stackoverflow.com/a/61628815/602544
//
// import this file in test _before_ importing the modules that use mui Slider which need mocks.
export {} // fool compiler into thinking this isn't a global script.

jest.mock('@mui/material/Slider', () => (props: any) => {
  const { id, name, min, max, onChange } = props;
  return (
    <input
      data-testid={props['data-testid']}
      type="range"
      id={id}
      name={name}
      min={min}
      max={max}
      onChange={(event) => onChange(event)}
    />
  );
});
