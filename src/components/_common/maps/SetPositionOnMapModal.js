import React from 'react';
import './SetPositionOnMapModal.scss';

import { GoogleApiWrapper, Map, Marker } from 'google-maps-react';
import apiKey from './apiKey';

import Modal from '../modal/_Modal';
import { getCoords } from './Geocode';
import { setPositionToStore, updateStoreLocation } from './setPositionToStore';

import {handleKeyboardEvents} from '../../../../utils/handleKeyboardEvents';
import getDeviceType from '../../../../utils/getDeviceType';

class SetPositionOnMapModal extends React.Component {
  // props: {
  //   submit = function to call on submit - return place, lat, lng, and address
  //   cancel = function to call on cancel
  //   lat = {props.lat}
  //   lng = {props.lng}
  //   address = {props.address}
  //   setCurrentPlace = {props.setCurrentPlace}
  //   setCurrentAddress = {props.setCurrentAddress}
  //   mapNote (string)
  //   place (string)
  //   mapError (String)
  //   mode (optional prop about whether to show map info from previous set)
  //   homeLocation - current home location

  state = {
    initialCenter: null,
    address: null,
    zoom: 4,
    readyForMap: false,
  };

  componentDidMount() {
    //bind keyboard shortcuts

    document.onkeydown = (e) => {
      handleKeyboardEvents(['enter', this.props.submit.bind(this, this.props.place, {lat: this.props.lat, lng: this.props.lng}, this.props.address)], ['escape', this.props.cancel], e);
    };

    //if mode = update, reset currentLocation info since they're making a new meetingPlace.
    if (this.props.mode && this.props.mode === "update") {
      this.props.setCurrentPlace('');
      this.props.setCurrentCoordinates({lat: this.props.homeLocation.lat, lng: this.props.homeLocation.lng});
      this.props.setCurrentAddress('');
    };

    //set initial position in state - start at homeLocation (or USA map if none is passed in)

    if (this.props.homeLocation) {
      console.log('lat and lng:', this.props.homeLocation.location.lat, this.props.homeLocation.location.lng);
      this.setState(() => ({
        initialCenter: {
          lat: this.props.homeLocation.location.lat,
          lng: this.props.homeLocation.location.lng,
        },
        zoom: 15,
        address: '',
        readyForMap: true,
      }));
    } else {
      this.setState(() => ({
        initialCenter: {
          lat: 35,
          lng:-92,
        },
        address: '',
        readyForMap: true,
      }));
    };

    //if a starting location was passed in from google maps
    setPositionToStore().then((location) => {
      if (!location.err) {
        //if it works
        this.setState(() => ({
          initialCenter: {
            lat: location.lat,
            lng: location.lng,
          },
          zoom: 15,
          address: location.address,
        }));

        this.currentMarker.marker.setPosition({ lat: location.lat, lng: location.lng });
        this.currentMap.map.setCenter({ lat: location.lat, lng: location.lng });
      };
    });
  };

  componentWillUnmount() {
    document.onkeydown = () => {};
  };

  submitEventPlace = () => {
    this.props.submit(this.props.place, {lat: this.props.lat, lng: this.props.lng}, this.props.address);
  };

  onPositionChanged = async () => {
    const lat = await this.currentMarker.marker.position.lat();
    const lng = await this.currentMarker.marker.position.lng();

    updateStoreLocation(lat, lng);
  };

  //name of place, set by typing
  changePlace = (e) => {
    this.props.setCurrentPlace(e.target.value);
  };

  changeAddress = (e) => {
    this.props.setCurrentAddress(e.target.value);
  };

  showAddressOnMap = async () => {
    const coords = await getCoords(this.props.address);

    Promise.all([
      this.currentMarker.marker.setPosition({ lat: coords.lat, lng: coords.lng }),
      this.currentMap.map.setCenter({ lat: coords.lat, lng: coords.lng }),
      this.setState(() => ({ zoom: 15 }))
    ]).then(() => {
      this.onPositionChanged();
    });
  };

  render() {
    return (
      <div>
        {(this.state.readyForMap) &&

        <Modal
          close = {this.props.cancel}
          deviceType = {this.props.deviceType}
        >
          {(getDeviceType() === 'mobile') &&
          <div className = "mobile-map-container show-pl">
            {/* map for mobile*/}
            <Map
              google = {this.props.google}
              initialCenter = {this.state.initialCenter}
              zoom = {this.state.zoom}
              ref = {(Map) => this.currentMap = Map}
              >
                <Marker
                  position = {this.state.initialCenter}
                  draggable = {true}
                  onDragend = {this.onPositionChanged}
                  ref = {(Marker) => this.currentMarker = Marker}
                />
              </Map>
            </div>
          }

          <div className = "map-info-box-pl scrollable-pl">
            <div className = "center">
              <div className = "map-note">
                {this.props.mapNote}
              </div>
            </div>

            <div className = "center--row">

              {(getDeviceType() === 'desktop') &&
              <div className = "modal-item-container map-container flex-fill-space show-d">
                {/* map for desktop */}
                <Map
                  google = {this.props.google}
                  initialCenter = {this.state.initialCenter}
                  zoom = {this.state.zoom}
                  ref = {(Map) => this.currentMap = Map}
                >
                  <Marker
                    position = {this.state.initialCenter}
                    draggable = {true}
                    onDragend = {this.onPositionChanged}
                    ref = {(Marker) => this.currentMarker = Marker}
                  />
                </Map>
              </div>
            }

              <form className = "modal-item-container map-height-d center flex-fill-space">

                  <div className = "value--no-width">
                    Search for an address:
                  </div>

                  <div className = "value--no-width">
                    <input
                      className = "input"
                      type = "text"
                      name = "address"
                      value = {this.props.address}
                      onChange = {this.changeAddress}
                      autoFocus
                    />
                  </div>

                  <div className = "value--no-width">
                    <div
                      className = "button width15 background-blue"
                      onClick = {this.showAddressOnMap}
                    >
                      Find on map
                    </div>
                  </div>

                  <div className = "flex-spacer" />

                  <div className = "center">
                  </div>

                  <div className = "value--no-width">
                    Name this place:
                  </div>

                  <input
                    className = "input width15"
                    type = "text"
                    name = "place"
                    value = {this.props.place}
                    onChange = {this.changePlace}
                  />

                  <div className = "error width15 rem-top-bottom">{this.props.mapError}</div>

                  <div className = "value--no-width">
                    <div
                      className = "button width15 background-green"
                      onClick = {this.submitEventPlace}
                    >
                      Use this place
                    </div>
                  </div>
                {/* </div> */}

                <div className = "value--no-width">
                  <div
                    className = "button width15 background-none"
                    onClick = {this.props.cancel}
                  >
                    Cancel
                  </div>
                </div>

              </form>
            </div>
          </div>
        </Modal>
        }
      </div>
    );
  };
};

export default GoogleApiWrapper({ apiKey })(SetPositionOnMapModal);
