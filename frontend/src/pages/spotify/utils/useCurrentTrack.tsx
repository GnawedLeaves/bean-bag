import { useEffect, useState } from "react";
import {
  getCurrentlyPlaying,
  getValidAccessToken,
} from "../../../services/spotify/spotify";
import { SpotifyCurrentPlaying } from "../../../types/spotifyTypes";

const mock: SpotifyCurrentPlaying = {
  "is_playing": true,
  "timestamp": 1773832662293,
  "context": {
    "external_urls": {
      "spotify": "https://open.spotify.com/playlist/625mul4nAeTNU9OqTUfckt"
    },
    "href": "https://api.spotify.com/v1/playlists/625mul4nAeTNU9OqTUfckt",
    "type": "playlist",
    "uri": "spotify:playlist:625mul4nAeTNU9OqTUfckt"
  },
  "progress_ms": 153700,
  "item": {
    "is_playable": true,
    "linked_from": {},
    "album": {
      "album_type": "compilation",
      "artists": [
        {
          "external_urls": {
            "spotify": "https://open.spotify.com/artist/3VNITwohbvU5Wuy5PC6dsI"
          },
          "href": "https://api.spotify.com/v1/artists/3VNITwohbvU5Wuy5PC6dsI",
          "id": "3VNITwohbvU5Wuy5PC6dsI",
          "name": "Kool & The Gang",
          "type": "artist",
          "uri": "spotify:artist:3VNITwohbvU5Wuy5PC6dsI"
        }
      ],
      "available_markets": [
        "AE",
        "AR",
        "AT",
        "AU",
        "BA",
        "BD",
        "BE",
        "BG",
        "BO",
        "BR",
        "CA",
        "CH",
        "CI",
        "CL",
        "CM",
        "CO",
        "CR",
        "CW",
        "CY",
        "CZ",
        "DE",
        "DK",
        "DO",
        "EC",
        "EE",
        "EG",
        "ES",
        "FI",
        "FJ",
        "FR",
        "GB",
        "GN",
        "GR",
        "GT",
        "HK",
        "HN",
        "HR",
        "HU",
        "IE",
        "IL",
        "IN",
        "IQ",
        "IS",
        "IT",
        "JO",
        "JP",
        "KH",
        "KR",
        "KW",
        "LB",
        "LK",
        "LT",
        "LU",
        "LV",
        "ME",
        "MK",
        "MT",
        "MU",
        "MY",
        "NG",
        "NI",
        "NL",
        "NO",
        "NZ",
        "OM",
        "PA",
        "PE",
        "PH",
        "PL",
        "PT",
        "PY",
        "QA",
        "RO",
        "RS",
        "RW",
        "SA",
        "SE",
        "SG",
        "SI",
        "SK",
        "SV",
        "TH",
        "TN",
        "TR",
        "TW",
        "UA",
        "US",
        "VE",
        "VN",
        "XK",
        "ZA"
      ],
      "external_urls": {
        "spotify": "https://open.spotify.com/album/02ez6TRQvxsxdA2LaCK5BU"
      },
      "href": "https://api.spotify.com/v1/albums/02ez6TRQvxsxdA2LaCK5BU",
      "id": "02ez6TRQvxsxdA2LaCK5BU",
      "images": [
        {
          "height": 640,
          "url": "https://i.scdn.co/image/ab67616d0000b2738a69fee00426f311d0056151",
          "width": 640
        },
        {
          "height": 300,
          "url": "https://i.scdn.co/image/ab67616d00001e028a69fee00426f311d0056151",
          "width": 300
        },
        {
          "height": 64,
          "url": "https://i.scdn.co/image/ab67616d000048518a69fee00426f311d0056151",
          "width": 64
        }
      ],
      "name": "Celebration / Morning Star",
      "release_date": "2009-01-01",
      "release_date_precision": "day",
      "total_tracks": 2,
      "type": "album",
      "uri": "spotify:album:02ez6TRQvxsxdA2LaCK5BU"
    },
    "artists": [
      {
        "external_urls": {
          "spotify": "https://open.spotify.com/artist/3VNITwohbvU5Wuy5PC6dsI"
        },
        "href": "https://api.spotify.com/v1/artists/3VNITwohbvU5Wuy5PC6dsI",
        "id": "3VNITwohbvU5Wuy5PC6dsI",
        "name": "Kool & The Gang",
        "type": "artist",
        "uri": "spotify:artist:3VNITwohbvU5Wuy5PC6dsI"
      }
    ],
    "available_markets": [
      "AE",
      "AR",
      "AT",
      "AU",
      "BA",
      "BD",
      "BE",
      "BG",
      "BO",
      "BR",
      "CA",
      "CH",
      "CI",
      "CL",
      "CM",
      "CO",
      "CR",
      "CW",
      "CY",
      "CZ",
      "DE",
      "DK",
      "DO",
      "EC",
      "EE",
      "EG",
      "ES",
      "FI",
      "FJ",
      "FR",
      "GB",
      "GN",
      "GR",
      "GT",
      "HK",
      "HN",
      "HR",
      "HU",
      "IE",
      "IL",
      "IN",
      "IQ",
      "IS",
      "IT",
      "JO",
      "JP",
      "KH",
      "KR",
      "KW",
      "LB",
      "LK",
      "LT",
      "LU",
      "LV",
      "ME",
      "MK",
      "MT",
      "MU",
      "MY",
      "NG",
      "NI",
      "NL",
      "NO",
      "NZ",
      "OM",
      "PA",
      "PE",
      "PH",
      "PL",
      "PT",
      "PY",
      "QA",
      "RO",
      "RS",
      "RW",
      "SA",
      "SE",
      "SG",
      "SI",
      "SK",
      "SV",
      "TH",
      "TN",
      "TR",
      "TW",
      "UA",
      "US",
      "VE",
      "VN",
      "XK",
      "ZA"
    ],
    "disc_number": 1,
    "duration_ms": 215653,
    "explicit": false,
    "external_ids": {
      "isrc": "USPR38007166",
      "ean": "",
      "upc": ""
    },
    "external_urls": {
      "spotify": "https://open.spotify.com/track/6CSLNGruNhqpb5zhfs5n3i"
    },
    "href": "https://api.spotify.com/v1/tracks/6CSLNGruNhqpb5zhfs5n3i",
    "id": "6CSLNGruNhqpb5zhfs5n3i",
    "is_local": false,
    "name": "Celebration - Single Version",
    "popularity": 56,
    "preview_url": "",
    "track_number": 1,
    "type": "track",
    "uri": "spotify:track:6CSLNGruNhqpb5zhfs5n3i"
  },
  "currently_playing_type": "track",
  "actions": {
    "disallows": {
      "resuming": true
    }
  }
}
const useCurrentTrack = (accessToken: string | null) => {
  const [currentPlaying, setCurrentPlaying] =
    useState<SpotifyCurrentPlaying | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log({ accessToken })
    if (!accessToken) return;

    const fetchNowPlaying = async () => {
      try {
        setIsLoading(true);

        const token = await getValidAccessToken();
        console.log({ token })
        const data = await getCurrentlyPlaying(token);
        console.log({ data })

        if (data?.item) {
          setCurrentPlaying(data);
          setError(null);
        } else {
          setCurrentPlaying(null);
        }
      } catch (err: any) {
        if (err.response?.status === 401) {
          // Token refresh itself failed — user needs to re-authenticate
          localStorage.removeItem("spotify_access_token");
          localStorage.removeItem("spotify_refresh_token");
          localStorage.removeItem("spotify_token_expiry");
          setError("Authentication failed. Please reconnect Spotify.");
        } else {
          setError("Failed to fetch current track");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchNowPlaying();
    const interval = setInterval(fetchNowPlaying, 10_000);
    return () => clearInterval(interval);
  }, [accessToken]);

  return { currentPlaying, isLoading, error };
};

export { useCurrentTrack };
