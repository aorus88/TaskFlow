import React, { useState } from 'react';
import { Form, InputGroup, FormControl, Button } from 'react-bootstrap';
import RibbonTab from './RibbonTab';
import RibbonGroup from './RibbonGroup';
import RibbonButton from './RibbonButton';
import '../../styles/ribbon.css';

const Ribbon = ({
  viewMode,
  onViewChange,
  onSearch,
  onCategoryChange,
  categories,
  onNewNote,
  searchTerm,
  selectedCategory,
  isEditing,
  onSave
}) => {
  const [activeTab, setActiveTab] = useState('home');

  return (
    <div className="office-ribbon">
      <div className="ribbon-tabs">
        <div 
          className={`ribbon-tab ${activeTab === 'home' ? 'active' : ''}`}
          onClick={() => setActiveTab('home')}
        >
          Accueil
        </div>
        <div 
          className={`ribbon-tab ${activeTab === 'insert' ? 'active' : ''}`}
          onClick={() => setActiveTab('insert')}
        >
          Insertion
        </div>
        <div 
          className={`ribbon-tab ${activeTab === 'view' ? 'active' : ''}`}
          onClick={() => setActiveTab('view')}
        >
          Affichage
        </div>
      </div>

      <div className="ribbon-content">
        {activeTab === 'home' && (
          <RibbonTab>
            <RibbonGroup title="Note">
              <RibbonButton 
                icon="plus-circle" 
                label="Nouvelle" 
                onClick={onNewNote} 
              />
              <RibbonButton 
                icon="save" 
                label={isEditing ? "Mettre à jour" : "Enregistrer"} 
                onClick={onSave} 
                primary
              />
            </RibbonGroup>

            <RibbonGroup title="Édition">
              <RibbonButton 
                icon="copy" 
                label="Copier" 
              />
              <RibbonButton 
                icon="cut" 
                label="Couper" 
              />
              <RibbonButton 
                icon="paste" 
                label="Coller" 
              />
            </RibbonGroup>

            <RibbonGroup title="Recherche">
              <InputGroup className="search-box">
                <InputGroup.Text>🔍</InputGroup.Text>
                <FormControl
                  placeholder="Rechercher..."
                  value={searchTerm}
                  onChange={(e) => onSearch(e.target.value)}
                />
              </InputGroup>
            </RibbonGroup>

            <RibbonGroup title="Filtrer">
              <Form.Select
                value={selectedCategory}
                onChange={(e) => onCategoryChange(e.target.value)}
                className="category-filter"
              >
                <option value="all">Toutes les catégories</option>
                {categories.map((cat, index) => (
                  <option key={index} value={cat}>
                    {cat}
                  </option>
                ))}
              </Form.Select>
            </RibbonGroup>
          </RibbonTab>
        )}

        {activeTab === 'insert' && (
          <RibbonTab>
            <RibbonGroup title="Éléments">
              <RibbonButton 
                icon="image" 
                label="Image" 
              />
              <RibbonButton 
                icon="table" 
                label="Tableau" 
              />
              <RibbonButton 
                icon="paperclip" 
                label="Pièce jointe" 
              />
            </RibbonGroup>
            <RibbonGroup title="Liens">
              <RibbonButton 
                icon="link" 
                label="Hyperlien" 
              />
            </RibbonGroup>
          </RibbonTab>
        )}

        {activeTab === 'view' && (
          <RibbonTab>
            <RibbonGroup title="Affichage">
              <div className="view-buttons">
                <Button
                  variant={viewMode === 'edit' ? 'primary' : 'outline-primary'}
                  onClick={() => onViewChange('edit')}
                  className="view-button"
                >
                  <i className="fas fa-edit"></i>
                  <span>Éditeur</span>
                </Button>
                <Button
                  variant={viewMode === 'kanban' ? 'primary' : 'outline-primary'}
                  onClick={() => onViewChange('kanban')}
                  className="view-button"
                >
                  <i className="fas fa-columns"></i>
                  <span>Kanban</span>
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'primary' : 'outline-primary'}
                  onClick={() => onViewChange('list')}
                  className="view-button"
                >
                  <i className="fas fa-list"></i>
                  <span>Liste</span>
                </Button>
              </div>
            </RibbonGroup>
            <RibbonGroup title="Zoom">
              <RibbonButton 
                icon="search-plus" 
                label="Zoom avant" 
              />
              <RibbonButton 
                icon="search-minus" 
                label="Zoom arrière" 
              />
            </RibbonGroup>
          </RibbonTab>
        )}
      </div>
    </div>
  );
};

export default Ribbon;
