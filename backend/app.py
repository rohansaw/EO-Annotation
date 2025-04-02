import os
import yaml
import ee
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict, List, Optional
from pydantic import BaseModel
from fastapi.responses import JSONResponse
from google.oauth2 import service_account

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Need to adjust for prod
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class Visualization(BaseModel):
    min: float
    max: float
    bands: List[str]
    gamma: float

class Collection(BaseModel):
    path: str
    dateStart: str
    dateEnd: str
    rename_bands: List[str]

class Config(BaseModel):
    collections: Dict[str, Collection]
    visualizations: Dict[str, Visualization]


def initialize_ee():
    service_account_file = '/home/rohan/Downloads/geekey.json'

    if service_account_file:
        credentials = service_account.Credentials.from_service_account_file(
            service_account_file,
            scopes=['https://www.googleapis.com/auth/earthengine']
        )
        ee.Initialize(credentials)
    else:
        raise Exception("GEE credentials not found. Ensure to provide a service account file.")


@app.on_event("startup")
async def startup_event():
    initialize_ee()

# Function to load configuration from YAML
def load_config(yaml_path: str = "config.yaml") -> Config:
    if not os.path.exists(yaml_path):
        raise HTTPException(status_code=404, detail=f"Config file {yaml_path} not found")
    
    try:
        with open(yaml_path, "r") as file:
            config_data = yaml.safe_load(file)
            return Config(**config_data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error loading config: {str(e)}")

@app.get("/collections")
async def get_collections(vis_type: Optional[str] = "plTC"):
    try:
        config = load_config()
        
        # Check if the requested visualization type exists
        if vis_type not in config.visualizations:
            return JSONResponse(
                status_code=400,
                content={"error": f"Visualization type '{vis_type}' not found. Available types: {list(config.visualizations.keys())}"}
            )
        
        vis_params = config.visualizations[vis_type]
        
        result = []
        for col_id, col_info in config.collections.items():
            try:
                image_collection = ee.ImageCollection(col_info.path)
                image = image_collection.max()

                if col_info.rename_bands:
                    image = image.rename(col_info.rename_bands)
                
                vis_params_dict = {
                    'bands': vis_params.bands,
                    'min': vis_params.min,
                    'max': vis_params.max,
                    'gamma': vis_params.gamma
                }
                
                map_id_dict = image.getMapId(vis_params_dict)
                xyz_url = map_id_dict['tile_fetcher'].url_format
                
                result.append({
                    "id": col_id,
                    "name": f"Planet {col_info.dateEnd}",
                    "dateStart": col_info.dateStart,
                    "dateEnd": col_info.dateEnd,
                    "xyzUrl": xyz_url
                })
            except Exception as e:
                print(f"Error processing collection {col_id}: {str(e)}")
        
        return result
    
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"error": str(e)}
        )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)