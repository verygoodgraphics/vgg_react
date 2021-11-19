import * as React from 'react';
import VGGLoader from '../../../';

export default class IndexPage extends React.Component {
  constructor(props: any) {
    super(props);
  }

  componentDidMount() {
    this.refs.vggLoader.setWork('hello', '/hello.vgg');
  }

  render() {
    return (
      <div style={{ 'backgroundColor': 'black' }}>
        <VGGLoader ref={'vggLoader'} />
      </div>
    );
  }
}
